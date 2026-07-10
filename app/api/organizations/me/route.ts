import type { NextRequest } from "next/server"
import { proxyOrganizationsRequest } from "@/lib/organizations-proxy"

export async function GET(request: NextRequest) {
  return proxyOrganizationsRequest(request, "/organizations/me", {
    unauthorizedMessage:
      "No se encontro un token de sesion para consultar salones.",
  })
}
