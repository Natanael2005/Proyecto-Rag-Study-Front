import type { NextRequest } from "next/server"
import { proxyBackendRequest } from "@/lib/backend-proxy"

export async function GET(request: NextRequest) {
  return proxyBackendRequest(request, "/users/me")
}
