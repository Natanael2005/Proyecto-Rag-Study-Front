import type { NextRequest } from "next/server"

type HeadersWithSetCookie = Headers & {
  getSetCookie?: () => string[]
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

  if (!accessToken) {
    return null
  }

  return normalizeAccessToken(accessToken)
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

function logAccessTokenForDebug(method: string, accessToken: string) {
  console.log("[documents-api] access_token enviado", {
    method,
    length: accessToken.length,
    startsWith: accessToken.slice(0, 16),
    endsWith: accessToken.slice(-16),
    authorizationHeaderPreview: `Bearer ${accessToken.slice(0, 16)}...${accessToken.slice(-16)}`,
  })
}

function createUnauthorizedResponse() {
  return Response.json(
    { message: "No se encontro un token de sesion para consultar documentos." },
    { status: 401 }
  )
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

async function refreshAccessToken(request: NextRequest) {
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

async function fetchDocumentsWithToken(accessToken: string) {
  return fetch(`${getRagApiUrl()}/documents/`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  })
}

async function uploadDocumentWithToken(accessToken: string, formData: FormData) {
  return fetch(`${getRagApiUrl()}/documents/`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
    cache: "no-store",
  })
}

export async function GET(request: NextRequest) {
  let accessToken = getAccessToken(request)

  if (!accessToken) {
    return createUnauthorizedResponse()
  }

  logAccessTokenForDebug("GET", accessToken)

  let response = await fetchDocumentsWithToken(accessToken)

  if (response.status === 401) {
    const refreshedSession = await refreshAccessToken(request)

    if (refreshedSession) {
      accessToken = refreshedSession.accessToken
      logAccessTokenForDebug("GET retry", accessToken)
      response = await fetchDocumentsWithToken(accessToken)

      return createResponseFromBackend(
        response,
        request,
        refreshedSession.setCookieHeaders
      )
    }
  }

  return createResponseFromBackend(response, request)
}

export async function POST(request: NextRequest) {
  let accessToken = getAccessToken(request)

  if (!accessToken) {
    return createUnauthorizedResponse()
  }

  logAccessTokenForDebug("POST", accessToken)

  const formData = await request.formData()

  let response = await uploadDocumentWithToken(accessToken, formData)

  if (response.status === 401) {
    const refreshedSession = await refreshAccessToken(request)

    if (refreshedSession) {
      accessToken = refreshedSession.accessToken
      logAccessTokenForDebug("POST retry", accessToken)
      response = await uploadDocumentWithToken(accessToken, formData)

      return createResponseFromBackend(
        response,
        request,
        refreshedSession.setCookieHeaders
      )
    }
  }

  return createResponseFromBackend(response, request)
}
