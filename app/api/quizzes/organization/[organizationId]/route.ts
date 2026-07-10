import type { NextRequest } from "next/server"
import { proxyFlashcardsRequest } from "@/lib/flashcards-proxy"

type OrganizationQuizzesRouteContext = {
  params: Promise<{
    organizationId: string
  }>
}

export async function GET(
  request: NextRequest,
  context: OrganizationQuizzesRouteContext
) {
  const { organizationId } = await context.params

  return proxyFlashcardsRequest(
    request,
    `/quizzes/organization/${encodeURIComponent(organizationId)}`,
    {
      unauthorizedMessage:
        "No se encontro un token de sesion para consultar los quizzes del salon.",
    }
  )
}
