import type { NextRequest } from "next/server"
import { proxyFlashcardsRequest } from "@/lib/flashcards-proxy"

type UnseenCardsRouteContext = {
  params: Promise<{
    deckId: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: UnseenCardsRouteContext
) {
  const { deckId } = await params

  return proxyFlashcardsRequest(
    request,
    `/decks/${encodeURIComponent(deckId)}/unseen`,
    {
      unauthorizedMessage:
        "No se encontro un token de sesion para consultar cards pendientes.",
    }
  )
}
