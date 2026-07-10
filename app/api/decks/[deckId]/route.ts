import type { NextRequest } from "next/server"
import { proxyFlashcardsRequest } from "@/lib/flashcards-proxy"

type DeckRouteContext = {
  params: Promise<{
    deckId: string
  }>
}

async function getDeckEndpoint(context: DeckRouteContext) {
  const { deckId } = await context.params

  return `/decks/${encodeURIComponent(deckId)}`
}

export async function GET(request: NextRequest, context: DeckRouteContext) {
  return proxyFlashcardsRequest(request, await getDeckEndpoint(context), {
    unauthorizedMessage:
      "No se encontro un token de sesion para consultar el deck.",
  })
}

export async function DELETE(request: NextRequest, context: DeckRouteContext) {
  return proxyFlashcardsRequest(request, await getDeckEndpoint(context), {
    body: null,
    method: "DELETE",
    unauthorizedMessage:
      "No se encontro un token de sesion para eliminar el deck.",
  })
}
