import type { NextRequest } from "next/server"
import { proxyRagRequest } from "@/lib/rag-proxy"

type SessionMessagesRouteContext = {
  params: Promise<{
    sessionId: string
  }>
}

async function getMessagesEndpoint(context: SessionMessagesRouteContext) {
  const { sessionId } = await context.params

  return `/rag/sessions/${encodeURIComponent(sessionId)}/messages`
}

export async function GET(
  request: NextRequest,
  context: SessionMessagesRouteContext
) {
  return proxyRagRequest(request, await getMessagesEndpoint(context), {
    unauthorizedMessage:
      "No se encontro un token de sesion para consultar mensajes.",
  })
}

export async function POST(
  request: NextRequest,
  context: SessionMessagesRouteContext
) {
  return proxyRagRequest(request, await getMessagesEndpoint(context), {
    unauthorizedMessage:
      "No se encontro un token de sesion para enviar mensajes.",
  })
}
