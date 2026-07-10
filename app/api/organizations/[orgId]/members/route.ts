import type { NextRequest } from "next/server"
import { proxyOrganizationsRequest } from "@/lib/organizations-proxy"

type OrganizationMembersRouteContext = {
  params: Promise<{
    orgId: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: OrganizationMembersRouteContext
) {
  const { orgId } = await params

  return proxyOrganizationsRequest(
    request,
    `/organizations/${encodeURIComponent(orgId)}/members`,
    {
      unauthorizedMessage:
        "No se encontro un token de sesion para consultar miembros.",
    }
  )
}
