import type { NextRequest } from "next/server"
import { proxyRagRequest } from "@/lib/rag-proxy"

type RegenerateRouteContext = {
  params: Promise<{
    sessionId: string
  }>
}

export async function POST(
  request: NextRequest,
  context: RegenerateRouteContext
) {
  const { sessionId } = await context.params

  return proxyRagRequest(
    request,
    `/rag/sessions/${encodeURIComponent(sessionId)}/regenerate`,
    {
      unauthorizedMessage:
        "No se encontro un token de sesion para regenerar la respuesta.",
    }
  )
}
