import type { NextRequest } from "next/server"
import { proxyFlashcardsRequest } from "@/lib/flashcards-proxy"

export async function POST(request: NextRequest) {
  return proxyFlashcardsRequest(request, "/decks/from-document", {
    unauthorizedMessage:
      "No se encontro un token de sesion para generar decks con IA.",
  })
}
