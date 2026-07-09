import type { NextRequest } from "next/server"

type HeadersWithSetCookie = Headers & {
  getSetCookie?: () => string[]
}

type RefreshedSession = {
  accessToken: string
  setCookieHeaders: string[]
}

type ProxyRagRequestOptions = {
  body?: BodyInit | null
  headers?: HeadersInit
  method?: string
  unauthorizedMessage?: string
}

function getRagApiUrl() {
  const apiUrl = process.env.RAG_API_URL

  if (!apiUrl) {
    throw new Error("Falta configurar RAG_API_URL en .env.local")
  }

  return apiUrl
}

function getAuthApiUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  if (!apiUrl) {
    throw new Error("Falta configurar NEXT_PUBLIC_API_URL en .env.local")
  }

  return apiUrl
}

function normalizeAccessToken(accessToken: string) {
  let normalizedToken = accessToken.trim()

  try {
    normalizedToken = decodeURIComponent(normalizedToken)
  } catch {
    // Si no viene URL-encoded, seguimos con el valor original.
  }

  return normalizedToken
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .trim()
    .replace(/^Bearer\s+/i, "")
    .trim()
    .replace(/^["']+|["']+$/g, "")
}

function getAccessToken(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value

  return accessToken ? normalizeAccessToken(accessToken) : null
}

function normalizeSetCookieHeader(cookie: string, request: NextRequest) {
  let normalizedCookie = cookie.replace(/;\s*Domain=[^;]+/gi, "")

  if (request.nextUrl.protocol === "http:") {
    normalizedCookie = normalizedCookie.replace(/;\s*Secure/gi, "")
    normalizedCookie = normalizedCookie.replace(
      /;\s*SameSite=None/gi,
      "; SameSite=Lax"
    )
  }

  return normalizedCookie
}

function splitSetCookieHeader(header: string) {
  return header.split(/,(?=\s*[^;,\s]+=)/g).map((cookie) => cookie.trim())
}

function getSetCookieHeaders(headers: Headers) {
  const headersWithSetCookie = headers as HeadersWithSetCookie
  const setCookieHeaders = headersWithSetCookie.getSetCookie?.() ?? []

  if (setCookieHeaders.length > 0) {
    return setCookieHeaders
  }

  const setCookie = headers.get("set-cookie")

  return setCookie ? splitSetCookieHeader(setCookie) : []
}

function extractAccessTokenFromSetCookie(setCookieHeaders: string[]) {
  const accessCookie = setCookieHeaders.find((cookie) =>
    cookie.toLowerCase().startsWith("access_token=")
  )

  if (!accessCookie) {
    return null
  }

  const cookieValue = accessCookie.split(";")[0]?.split("=").slice(1).join("=")

  return cookieValue ? normalizeAccessToken(cookieValue) : null
}

function createUnauthorizedResponse(message: string) {
  return Response.json({ message }, { status: 401 })
}

function createResponseFromBackend(
  response: Response,
  request: NextRequest,
  setCookieHeaders: string[] = []
) {
  const headers = new Headers()
  const contentType = response.headers.get("content-type")

  if (contentType) {
    headers.set("Content-Type", contentType)
  }

  setCookieHeaders.forEach((cookie) => {
    headers.append("set-cookie", normalizeSetCookieHeader(cookie, request))
  })

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

async function refreshAccessToken(
  request: NextRequest
): Promise<RefreshedSession | null> {
  const cookieHeader = request.headers.get("cookie")

  if (!cookieHeader) {
    return null
  }

  const response = await fetch(`${getAuthApiUrl()}/auth/refresh`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Cookie: cookieHeader,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    return null
  }

  const setCookieHeaders = getSetCookieHeaders(response.headers)
  const accessToken = extractAccessTokenFromSetCookie(setCookieHeaders)

  if (!accessToken) {
    return null
  }

  return {
    accessToken,
    setCookieHeaders,
  }
}

async function getRequestBody(
  request: NextRequest,
  method: string,
  providedBody?: BodyInit | null
) {
  if (providedBody !== undefined) {
    return providedBody
  }

  if (method === "GET" || method === "HEAD") {
    return undefined
  }

  return request.text()
}

async function fetchRagWithToken(
  request: NextRequest,
  endpoint: string,
  accessToken: string,
  options: ProxyRagRequestOptions
) {
  const method = options.method ?? request.method
  const body = options.body
  const headers = new Headers(options.headers)
  const contentType = request.headers.get("content-type")
  const accept = request.headers.get("accept")

  if (!headers.has("Accept")) {
    headers.set("Accept", accept ?? "application/json")
  }

  if (contentType && !headers.has("Content-Type") && !(body instanceof FormData)) {
    headers.set("Content-Type", contentType)
  }

  headers.set("Authorization", `Bearer ${accessToken}`)

  return fetch(`${getRagApiUrl()}${endpoint}`, {
    method,
    headers,
    body,
    cache: "no-store",
  })
}

export async function proxyRagRequest(
  request: NextRequest,
  endpoint: string,
  options: ProxyRagRequestOptions = {}
) {
  const method = options.method ?? request.method
  const body = await getRequestBody(request, method, options.body)
  const requestOptions = {
    ...options,
    body,
    method,
  }
  let accessToken = getAccessToken(request)

  if (!accessToken) {
    return createUnauthorizedResponse(
      options.unauthorizedMessage ??
        "No se encontro un token de sesion para consultar RAG."
    )
  }

  let response = await fetchRagWithToken(
    request,
    endpoint,
    accessToken,
    requestOptions
  )

  if (response.status === 401) {
    const refreshedSession = await refreshAccessToken(request)

    if (refreshedSession) {
      accessToken = refreshedSession.accessToken
      response = await fetchRagWithToken(
        request,
        endpoint,
        accessToken,
        requestOptions
      )

      return createResponseFromBackend(
        response,
        request,
        refreshedSession.setCookieHeaders
      )
    }
  }

  return createResponseFromBackend(response, request)
}
