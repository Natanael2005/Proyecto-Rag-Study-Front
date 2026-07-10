import type { NextRequest } from "next/server"
import { proxyRagRequest, type ProxyRagRequestOptions } from "@/lib/rag-proxy"

export function getFlashcardsApiUrl() {
  const apiUrl = process.env.FLASHCARDS_API_URL

  if (!apiUrl) {
    throw new Error("Falta configurar FLASHCARDS_API_URL en .env.local")
  }

  return apiUrl.replace(/\/$/, "")
}

export function proxyFlashcardsRequest(
  request: NextRequest,
  endpoint: string,
  options: ProxyRagRequestOptions = {}
) {
  return proxyRagRequest(request, endpoint, {
    ...options,
    apiUrl: getFlashcardsApiUrl(),
  })
}
