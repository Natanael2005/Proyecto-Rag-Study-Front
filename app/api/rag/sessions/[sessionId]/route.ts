import type { NextRequest } from "next/server"
import { proxyRagRequest } from "@/lib/rag-proxy"

type SessionRouteContext = {
  params: Promise<{
    sessionId: string
  }>
}

async function getSessionEndpoint(context: SessionRouteContext) {
  const { sessionId } = await context.params

  return `/rag/sessions/${encodeURIComponent(sessionId)}`
}

export async function PATCH(
  request: NextRequest,
  context: SessionRouteContext
) {
  return proxyRagRequest(request, await getSessionEndpoint(context), {
    unauthorizedMessage:
      "No se encontro un token de sesion para actualizar la sala.",
  })
}

export async function DELETE(
  request: NextRequest,
  context: SessionRouteContext
) {
  return proxyRagRequest(request, await getSessionEndpoint(context), {
    unauthorizedMessage:
      "No se encontro un token de sesion para eliminar la sala.",
  })
}
