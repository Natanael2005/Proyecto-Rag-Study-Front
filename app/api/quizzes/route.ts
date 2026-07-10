import type { NextRequest } from "next/server"
import { proxyFlashcardsRequest } from "@/lib/flashcards-proxy"

export async function GET(request: NextRequest) {
  return proxyFlashcardsRequest(request, `/quizzes${request.nextUrl.search}`, {
    unauthorizedMessage:
      "No se encontro un token de sesion para consultar quizzes.",
  })
}

export async function POST(request: NextRequest) {
  return proxyFlashcardsRequest(request, "/quizzes", {
    unauthorizedMessage:
      "No se encontro un token de sesion para crear quizzes.",
  })
}
