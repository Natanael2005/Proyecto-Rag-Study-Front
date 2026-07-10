import type { NextRequest } from "next/server"
import { proxyFlashcardsRequest } from "@/lib/flashcards-proxy"

type CardLlmEditRouteContext = {
  params: Promise<{
    deckId: string
    cardId: string
  }>
}

export async function POST(
  request: NextRequest,
  { params }: CardLlmEditRouteContext
) {
  const { deckId, cardId } = await params

  return proxyFlashcardsRequest(
    request,
    `/decks/${encodeURIComponent(deckId)}/cards/${encodeURIComponent(
      cardId
    )}/llm-edit`,
    {
      unauthorizedMessage:
        "No se encontro un token de sesion para proponer ediciones con IA.",
    }
  )
}
