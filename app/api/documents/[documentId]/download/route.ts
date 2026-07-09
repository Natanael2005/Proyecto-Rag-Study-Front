import type { NextRequest } from "next/server"
import { proxyRagRequest } from "@/lib/rag-proxy"

type DocumentDownloadRouteContext = {
  params: Promise<{
    documentId: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: DocumentDownloadRouteContext
) {
  const { documentId } = await params

  return proxyRagRequest(
    request,
    `/documents/${encodeURIComponent(documentId)}/download`,
    {
      headers: {
        Accept: "application/json, text/plain, */*",
      },
      method: "GET",
      unauthorizedMessage:
        "No se encontro un token de sesion para descargar documentos.",
    }
  )
}
