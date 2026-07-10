import type { NextRequest } from "next/server"
import { proxyOrganizationsRequest } from "@/lib/organizations-proxy"

type OrganizationRouteContext = {
  params: Promise<{
    orgId: string
  }>
}

async function getOrganizationEndpoint(context: OrganizationRouteContext) {
  const { orgId } = await context.params

  return `/organizations/${encodeURIComponent(orgId)}`
}

export async function PATCH(
  request: NextRequest,
  context: OrganizationRouteContext
) {
  return proxyOrganizationsRequest(request, await getOrganizationEndpoint(context), {
    method: "PATCH",
    unauthorizedMessage:
      "No se encontro un token de sesion para editar el salon.",
  })
}

export async function DELETE(
  request: NextRequest,
  context: OrganizationRouteContext
) {
  return proxyOrganizationsRequest(request, await getOrganizationEndpoint(context), {
    body: null,
    method: "DELETE",
    unauthorizedMessage:
      "No se encontro un token de sesion para eliminar el salon.",
  })
}
