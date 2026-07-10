import type { NextRequest } from "next/server"
import { proxyFlashcardsRequest } from "@/lib/flashcards-proxy"

type OrganizationDecksRouteContext = {
  params: Promise<{
    organizationId: string
  }>
}

export async function GET(
  request: NextRequest,
  context: OrganizationDecksRouteContext
) {
  const { organizationId } = await context.params

  return proxyFlashcardsRequest(
    request,
    `/decks/organization/${encodeURIComponent(organizationId)}`,
    {
      unauthorizedMessage:
        "No se encontro un token de sesion para consultar los decks del salon.",
    }
  )
}
