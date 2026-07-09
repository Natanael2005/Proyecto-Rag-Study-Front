import type { NextRequest } from "next/server"
import {
  createRagAuthenticatedResponse,
  getRagApiUrl,
} from "@/lib/rag-documents-proxy"

async function fetchDocumentsWithToken(accessToken: string) {
  return fetch(`${getRagApiUrl()}/documents/`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  })
}

async function uploadDocumentWithToken(accessToken: string, formData: FormData) {
  return fetch(`${getRagApiUrl()}/documents/`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
    cache: "no-store",
  })
}

export async function GET(request: NextRequest) {
  return createRagAuthenticatedResponse(request, "GET", fetchDocumentsWithToken)
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()

  return createRagAuthenticatedResponse(request, "POST", (accessToken) =>
    uploadDocumentWithToken(accessToken, formData)
  )
}
