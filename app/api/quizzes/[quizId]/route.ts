import type { NextRequest } from "next/server"
import { proxyFlashcardsRequest } from "@/lib/flashcards-proxy"

type QuizRouteContext = {
  params: Promise<{
    quizId: string
  }>
}

async function getQuizEndpoint(context: QuizRouteContext) {
  const { quizId } = await context.params

  return `/quizzes/${encodeURIComponent(quizId)}`
}

export async function GET(request: NextRequest, context: QuizRouteContext) {
  return proxyFlashcardsRequest(request, await getQuizEndpoint(context), {
    unauthorizedMessage:
      "No se encontro un token de sesion para consultar el quiz.",
  })
}
