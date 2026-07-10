import type { NextRequest } from "next/server"
import { proxyRagRequest, type ProxyRagRequestOptions } from "@/lib/rag-proxy"

export function getOrganizationsApiUrl() {
  const apiUrl = process.env.ORGANIZATIONS_API_URL

  if (!apiUrl) {
    throw new Error("Falta configurar ORGANIZATIONS_API_URL en .env.local")
  }

  return apiUrl.replace(/\/$/, "")
}

export function proxyOrganizationsRequest(
  request: NextRequest,
  endpoint: string,
  options: ProxyRagRequestOptions = {}
) {
  return proxyRagRequest(request, endpoint, {
    ...options,
    apiUrl: getOrganizationsApiUrl(),
  })
}
