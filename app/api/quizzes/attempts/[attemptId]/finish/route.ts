import type { NextRequest } from "next/server"
import { proxyFlashcardsRequest } from "@/lib/flashcards-proxy"

type QuizFinishRouteContext = {
  params: Promise<{
    attemptId: string
  }>
}

export async function POST(request: NextRequest, context: QuizFinishRouteContext) {
  const { attemptId } = await context.params

  return proxyFlashcardsRequest(
    request,
    `/quizzes/attempts/${encodeURIComponent(attemptId)}/finish`,
    {
      unauthorizedMessage:
        "No se encontro un token de sesion para finalizar el intento.",
    }
  )
}
