import { ApiRequestError } from "@/lib/auth-api"

export type QuizQuestion = {
  id: string
  quiz_id?: string
  question: string
  options: string[]
  correct_answer?: string
  explanation?: string
}

export type Quiz = {
  id: string
  user_id?: string
  document_id?: string | null
  title: string
  created_at?: string
  question_count?: number
  answers_revealed?: boolean
  questions?: QuizQuestion[]
}

export type CreateQuizPayload = {
  title: string
  document_id?: string
  questions: Array<{
    question: string
    options: string[]
    correct_answer: string
    explanation?: string
  }>
}

export type QuizAttempt = {
  id: string
  quiz_id: string
  user_id?: string
  status?: string
  score?: number
  created_at?: string
}

export type SaveQuizAnswerPayload = {
  question_id: string
  user_answer: string
}

export type QuizAnswerResult = {
  attempt_id?: string
  question_id?: string
  saved?: boolean
}

export type QuizResultItem = {
  question_id: string
  question: string
  options: string[]
  correct_answer: string
  user_answer?: string
  is_correct: boolean
  explanation?: string
}

export type QuizAttemptResult = {
  attempt_id: string
  quiz_id: string
  status?: string
  score: number
  correct_count: number
  total_questions: number
  answered_count: number
  results: QuizResultItem[]
}

async function parseResponseData(response: Response) {
  const contentType = response.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    return response.json().catch(() => null)
  }

  return response.text().catch(() => null)
}

function getErrorMessage(data: unknown, fallbackMessage: string) {
  if (typeof data === "string" && data.trim() !== "") {
    return data
  }

  const errorData = data as
    | {
        detail?: string | { msg?: string }[]
        message?: string
        error?: string
      }
    | null

  if (typeof errorData?.detail === "string") {
    return errorData.detail
  }

  if (Array.isArray(errorData?.detail) && errorData.detail.length > 0) {
    return errorData.detail[0].msg ?? fallbackMessage
  }

  return errorData?.message || errorData?.error || fallbackMessage
}

async function requestQuizzes(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers)

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json")
  }

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(endpoint, {
    ...options,
    credentials: "include",
    headers,
  })
  const data = await parseResponseData(response)

  if (!response.ok) {
    throw new ApiRequestError(
      getErrorMessage(data, "No se pudo completar la accion de quizzes."),
      response.status,
      data
    )
  }

  return data
}

function getQuizEndpoint(quizId: string) {
  return `/api/quizzes/${encodeURIComponent(quizId)}`
}

function getAttemptEndpoint(attemptId: string) {
  return `/api/quizzes/attempts/${encodeURIComponent(attemptId)}`
}

export function getQuizzes() {
  return requestQuizzes("/api/quizzes", {
    method: "GET",
  })
}

export function createQuiz(payload: CreateQuizPayload) {
  return requestQuizzes("/api/quizzes", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function getQuiz(quizId: string) {
  return requestQuizzes(getQuizEndpoint(quizId), {
    method: "GET",
  })
}

export function startQuizAttempt(quizId: string) {
  return requestQuizzes(`${getQuizEndpoint(quizId)}/attempts`, {
    method: "POST",
  })
}

export function saveQuizAnswer(
  attemptId: string,
  payload: SaveQuizAnswerPayload
) {
  return requestQuizzes(`${getAttemptEndpoint(attemptId)}/answers`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function finishQuizAttempt(attemptId: string) {
  return requestQuizzes(`${getAttemptEndpoint(attemptId)}/finish`, {
    method: "POST",
  })
}
