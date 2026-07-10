import type { NextRequest } from "next/server"
import { proxyOrganizationsRequest } from "@/lib/organizations-proxy"

export async function POST(request: NextRequest) {
  return proxyOrganizationsRequest(request, "/organizations/", {
    method: "POST",
    unauthorizedMessage:
      "No se encontro un token de sesion para crear salones.",
  })
}
