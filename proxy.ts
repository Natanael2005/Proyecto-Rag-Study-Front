import { NextResponse, type NextRequest } from "next/server"

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL
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

async function fetchWithSession(
  apiUrl: string,
  endpoint: string,
  cookieHeader: string,
  method = "GET"
) {
  return fetch(`${apiUrl}${endpoint}`, {
    method,
    headers: {
      Accept: "application/json",
      Cookie: cookieHeader,
    },
    cache: "no-store",
  })
}

function appendSetCookieHeaders(
  response: NextResponse,
  sourceResponse: Response,
  request: NextRequest
) {
  const setCookie = sourceResponse.headers.get("set-cookie")

  if (!setCookie) {
    return
  }

  splitSetCookieHeader(setCookie).forEach((cookie) => {
    response.headers.append("set-cookie", normalizeSetCookieHeader(cookie, request))
  })
}

export async function proxy(request: NextRequest) {
  const apiUrl = getApiUrl()
  const loginUrl = new URL("/auth/login", request.url)
  loginUrl.searchParams.set("next", request.nextUrl.pathname)

  if (!apiUrl) {
    return NextResponse.redirect(loginUrl)
  }

  const cookieHeader = request.headers.get("cookie")

  if (!cookieHeader) {
    return NextResponse.redirect(loginUrl)
  }

  try {
    const profileResponse = await fetchWithSession(
      apiUrl,
      "/users/me",
      cookieHeader
    )

    if (profileResponse.ok) {
      return NextResponse.next()
    }

    if (profileResponse.status !== 401) {
      return NextResponse.redirect(loginUrl)
    }

    const authResponse = await fetchWithSession(
      apiUrl,
      "/auth/refresh",
      cookieHeader,
      "POST"
    )

    if (!authResponse.ok) {
      return NextResponse.redirect(loginUrl)
    }

    const response = NextResponse.next()
    appendSetCookieHeaders(response, authResponse, request)

    return response
  } catch {
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: "/dashboard/:path*",
}
