import type { NextRequest } from "next/server"

type HeadersWithSetCookie = Headers & {
  getSetCookie?: () => string[]
}

function getApiUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  if (!apiUrl) {
    throw new Error("Falta configurar NEXT_PUBLIC_API_URL en .env.local")
  }

  return apiUrl
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

function appendSetCookieHeaders(
  targetHeaders: Headers,
  sourceHeaders: Headers,
  request: NextRequest
) {
  const headersWithSetCookie = sourceHeaders as HeadersWithSetCookie
  const setCookieHeaders = headersWithSetCookie.getSetCookie?.() ?? []

  if (setCookieHeaders.length > 0) {
    setCookieHeaders.forEach((cookie) => {
      targetHeaders.append("set-cookie", normalizeSetCookieHeader(cookie, request))
    })
    return
  }

  const setCookie = sourceHeaders.get("set-cookie")

  if (setCookie) {
    splitSetCookieHeader(setCookie).forEach((cookie) => {
      targetHeaders.append("set-cookie", normalizeSetCookieHeader(cookie, request))
    })
  }
}

export async function proxyBackendRequest(
  request: NextRequest,
  endpoint: string
) {
  const apiUrl = getApiUrl()
  const requestHeaders = new Headers()
  const contentType = request.headers.get("content-type")
  const accept = request.headers.get("accept")
  const cookie = request.headers.get("cookie")

  if (contentType) {
    requestHeaders.set("Content-Type", contentType)
  }

  requestHeaders.set("Accept", accept ?? "application/json")

  if (cookie) {
    requestHeaders.set("Cookie", cookie)
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD"
  const body = hasBody ? await request.text() : undefined

  const backendResponse = await fetch(`${apiUrl}${endpoint}`, {
    method: request.method,
    headers: requestHeaders,
    body,
    cache: "no-store",
  })

  const responseHeaders = new Headers()
  const responseContentType = backendResponse.headers.get("content-type")

  if (responseContentType) {
    responseHeaders.set("Content-Type", responseContentType)
  }

  appendSetCookieHeaders(responseHeaders, backendResponse.headers, request)

  return new Response(backendResponse.body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: responseHeaders,
  })
}
