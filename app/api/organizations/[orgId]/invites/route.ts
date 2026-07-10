import type { NextRequest } from "next/server"
import { proxyOrganizationsRequest } from "@/lib/organizations-proxy"

type OrganizationInvitesRouteContext = {
  params: Promise<{
    orgId: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: OrganizationInvitesRouteContext
) {
  const { orgId } = await params

  return proxyOrganizationsRequest(
    request,
    `/organizations/${encodeURIComponent(orgId)}/invites`,
    {
      unauthorizedMessage:
        "No se encontro un token de sesion para consultar invitaciones.",
    }
  )
}
