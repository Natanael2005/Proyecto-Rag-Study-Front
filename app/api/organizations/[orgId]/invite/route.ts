import type { NextRequest } from "next/server"
import { proxyOrganizationsRequest } from "@/lib/organizations-proxy"

type OrganizationInviteRouteContext = {
  params: Promise<{
    orgId: string
  }>
}

export async function POST(
  request: NextRequest,
  { params }: OrganizationInviteRouteContext
) {
  const { orgId } = await params

  return proxyOrganizationsRequest(
    request,
    `/organizations/${encodeURIComponent(orgId)}/invite`,
    {
      method: "POST",
      unauthorizedMessage:
        "No se encontro un token de sesion para invitar alumnos.",
    }
  )
}
