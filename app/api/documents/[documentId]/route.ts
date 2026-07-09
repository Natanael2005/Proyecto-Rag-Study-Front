import type { NextRequest } from "next/server"
import { proxyRagRequest } from "@/lib/rag-proxy"

type DocumentRouteContext = {
  params: Promise<{
    documentId: string
  }>
}

export async function DELETE(
  request: NextRequest,
  { params }: DocumentRouteContext
) {
  const { documentId } = await params

  return proxyRagRequest(request, `/documents/${encodeURIComponent(documentId)}`, {
    body: null,
    method: "DELETE",
    unauthorizedMessage:
      "No se encontro un token de sesion para eliminar documentos.",
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: DocumentRouteContext
) {
  const { documentId } = await params

  return proxyRagRequest(request, `/documents/${encodeURIComponent(documentId)}`, {
    method: "PATCH",
    unauthorizedMessage:
      "No se encontro un token de sesion para renombrar documentos.",
  })
}
