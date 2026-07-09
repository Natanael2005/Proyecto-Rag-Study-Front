import type { NextRequest } from "next/server"
import { proxyRagRequest } from "@/lib/rag-proxy"

type MessageRouteContext = {
  params: Promise<{
    messageId: string
  }>
}

export async function DELETE(
  request: NextRequest,
  { params }: MessageRouteContext
) {
  const { messageId } = await params

  return proxyRagRequest(
    request,
    `/rag/messages/${encodeURIComponent(messageId)}`,
    {
      body: null,
      method: "DELETE",
      unauthorizedMessage:
        "No se encontro un token de sesion para eliminar el mensaje.",
    }
  )
}
