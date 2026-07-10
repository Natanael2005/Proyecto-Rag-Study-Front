import type { NextRequest } from "next/server"
import { proxyFlashcardsRequest } from "@/lib/flashcards-proxy"

type DeckCardRouteContext = {
  params: Promise<{
    deckId: string
    cardId: string
  }>
}

async function getCardEndpoint(context: DeckCardRouteContext) {
  const { deckId, cardId } = await context.params

  return `/decks/${encodeURIComponent(deckId)}/cards/${encodeURIComponent(
    cardId
  )}`
}

export async function PATCH(request: NextRequest, context: DeckCardRouteContext) {
  return proxyFlashcardsRequest(request, await getCardEndpoint(context), {
    unauthorizedMessage:
      "No se encontro un token de sesion para actualizar la card.",
  })
}

export async function DELETE(
  request: NextRequest,
  context: DeckCardRouteContext
) {
  return proxyFlashcardsRequest(request, await getCardEndpoint(context), {
    body: null,
    method: "DELETE",
    unauthorizedMessage:
      "No se encontro un token de sesion para eliminar la card.",
  })
}
