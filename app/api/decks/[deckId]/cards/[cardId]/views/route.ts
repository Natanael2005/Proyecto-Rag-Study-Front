import type { NextRequest } from "next/server"
import { proxyFlashcardsRequest } from "@/lib/flashcards-proxy"

type CardViewsRouteContext = {
  params: Promise<{
    deckId: string
    cardId: string
  }>
}

async function getViewsEndpoint({ params }: CardViewsRouteContext) {
  const { deckId, cardId } = await params

  return `/decks/${encodeURIComponent(deckId)}/cards/${encodeURIComponent(
    cardId
  )}/views`
}

export async function GET(request: NextRequest, context: CardViewsRouteContext) {
  return proxyFlashcardsRequest(request, await getViewsEndpoint(context), {
    unauthorizedMessage:
      "No se encontro un token de sesion para consultar vistas de la card.",
  })
}

export async function POST(request: NextRequest, context: CardViewsRouteContext) {
  return proxyFlashcardsRequest(request, await getViewsEndpoint(context), {
    body: null,
    method: "POST",
    unauthorizedMessage:
      "No se encontro un token de sesion para marcar la card como vista.",
  })
}
