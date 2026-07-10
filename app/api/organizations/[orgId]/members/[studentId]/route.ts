import type { NextRequest } from "next/server"
import { proxyOrganizationsRequest } from "@/lib/organizations-proxy"

type OrganizationStudentRouteContext = {
  params: Promise<{
    orgId: string
    studentId: string
  }>
}

export async function PATCH(
  request: NextRequest,
  { params }: OrganizationStudentRouteContext
) {
  const { orgId, studentId } = await params

  return proxyOrganizationsRequest(
    request,
    `/organizations/${encodeURIComponent(orgId)}/members/${encodeURIComponent(
      studentId
    )}`,
    {
      method: "PATCH",
      unauthorizedMessage:
        "No se encontro un token de sesion para actualizar al alumno.",
    }
  )
}
