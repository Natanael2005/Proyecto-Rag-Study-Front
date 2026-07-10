import type { NextRequest } from "next/server"
import { proxyOrganizationsRequest } from "@/lib/organizations-proxy"

type OrganizationQrRouteContext = {
  params: Promise<{
    orgId: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: OrganizationQrRouteContext
) {
  const { orgId } = await params

  return proxyOrganizationsRequest(
    request,
    `/organizations/${encodeURIComponent(orgId)}/qr`,
    {
      unauthorizedMessage:
        "No se encontro un token de sesion para consultar el codigo QR.",
    }
  )
}
