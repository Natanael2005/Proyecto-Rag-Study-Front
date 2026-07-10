import type { NextRequest } from "next/server"
import { proxyFlashcardsRequest } from "@/lib/flashcards-proxy"

type QuizAnswerRouteContext = {
  params: Promise<{
    attemptId: string
  }>
}

export async function POST(request: NextRequest, context: QuizAnswerRouteContext) {
  const { attemptId } = await context.params

  return proxyFlashcardsRequest(
    request,
    `/quizzes/attempts/${encodeURIComponent(attemptId)}/answers`,
    {
      unauthorizedMessage:
        "No se encontro un token de sesion para guardar la respuesta.",
    }
  )
}
