import type { NextRequest } from "next/server"
import {
  createRagAuthenticatedResponse,
  getRagApiUrl,
} from "@/lib/rag-documents-proxy"

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

  return createRagAuthenticatedResponse(
    request,
    `DOWNLOAD ${documentId}`,
    (accessToken) =>
      fetch(
        `${getRagApiUrl()}/documents/${encodeURIComponent(documentId)}/download`,
        {
          method: "GET",
          headers: {
            Accept: "application/json, text/plain, */*",
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        }
      )
  )
}
