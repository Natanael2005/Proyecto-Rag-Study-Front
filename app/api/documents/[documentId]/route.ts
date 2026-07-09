import type { NextRequest } from "next/server"
import {
  createRagAuthenticatedResponse,
  getRagApiUrl,
} from "@/lib/rag-documents-proxy"

type DocumentRouteContext = {
  params: Promise<{
    documentId: string
  }>
}

function getDocumentUrl(documentId: string) {
  return `${getRagApiUrl()}/documents/${encodeURIComponent(documentId)}`
}

export async function DELETE(
  request: NextRequest,
  { params }: DocumentRouteContext
) {
  const { documentId } = await params

  return createRagAuthenticatedResponse(
    request,
    `DELETE ${documentId}`,
    (accessToken) =>
      fetch(getDocumentUrl(documentId), {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      })
  )
}

export async function PATCH(
  request: NextRequest,
  { params }: DocumentRouteContext
) {
  const { documentId } = await params
  const body = await request.text()

  return createRagAuthenticatedResponse(
    request,
    `PATCH ${documentId}`,
    (accessToken) =>
      fetch(getDocumentUrl(documentId), {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body,
        cache: "no-store",
      })
  )
}
