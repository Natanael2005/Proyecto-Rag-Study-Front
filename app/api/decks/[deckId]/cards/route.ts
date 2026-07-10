import type { NextRequest } from "next/server"
import { proxyFlashcardsRequest } from "@/lib/flashcards-proxy"

type DeckCardsRouteContext = {
  params: Promise<{
    deckId: string
  }>
}

async function getCardsEndpoint(context: DeckCardsRouteContext) {
  const { deckId } = await context.params

  return `/decks/${encodeURIComponent(deckId)}/cards`
}

export async function POST(
  request: NextRequest,
  context: DeckCardsRouteContext
) {
  return proxyFlashcardsRequest(request, await getCardsEndpoint(context), {
    unauthorizedMessage:
      "No se encontro un token de sesion para crear cards.",
  })
}
