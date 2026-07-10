import type { NextRequest } from "next/server"
import { proxyBackendRequest } from "@/lib/backend-proxy"

const allowedAuthPaths = new Set(["login", "refresh", "logout"])

type AuthRouteContext = {
  params: Promise<{
    path: string[]
  }>
}

async function handleAuthRequest(
  request: NextRequest,
  { params }: AuthRouteContext
) {
  const { path } = await params
  const authPath = path.join("/")

  if (!allowedAuthPaths.has(authPath)) {
    return Response.json({ message: "Ruta de autenticacion no permitida." }, {
      status: 404,
    })
  }

  return proxyBackendRequest(request, `/auth/${authPath}`)
}

export async function POST(
  request: NextRequest,
  context: AuthRouteContext
) {
  return handleAuthRequest(request, context)
}
