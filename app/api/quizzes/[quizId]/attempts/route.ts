import type { NextRequest } from "next/server"
import { proxyFlashcardsRequest } from "@/lib/flashcards-proxy"

type QuizAttemptRouteContext = {
  params: Promise<{
    quizId: string
  }>
}

export async function POST(
  request: NextRequest,
  context: QuizAttemptRouteContext
) {
  const { quizId } = await context.params

  return proxyFlashcardsRequest(
    request,
    `/quizzes/${encodeURIComponent(quizId)}/attempts`,
    {
      unauthorizedMessage:
        "No se encontro un token de sesion para iniciar el intento.",
    }
  )
}
