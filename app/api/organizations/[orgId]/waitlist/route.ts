import type { NextRequest } from "next/server"
import { proxyOrganizationsRequest } from "@/lib/organizations-proxy"

type OrganizationWaitlistRouteContext = {
  params: Promise<{
    orgId: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: OrganizationWaitlistRouteContext
) {
  const { orgId } = await params

  return proxyOrganizationsRequest(
    request,
    `/organizations/${encodeURIComponent(orgId)}/waitlist`,
    {
      unauthorizedMessage:
        "No se encontro un token de sesion para consultar la lista de espera.",
    }
  )
}
