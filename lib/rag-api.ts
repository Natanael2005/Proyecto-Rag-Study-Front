import { ApiRequestError } from "@/lib/auth-api"

export type RagSession = {
  id: string
  user_id?: string
  title: string
  created_at?: string
}

export type RagDocument = {
  id: string
  user_id?: string
  organization_id?: string | null
  title: string
  file_url?: string | null
  status?: string
  last_read_page?: number
  created_at?: string
}

export type RagMessage = {
  id: string
  session_id: string
  role: "human" | "ai" | string
  content: string
  created_at?: string
}

export type CreateRagSessionPayload = {
  title: string
  document_ids: string[]
}

export type SendRagMessagePayload = {
  mensaje: string
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

async function requestRag(endpoint: string, options: RequestInit = {}) {
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
      getErrorMessage(data, "No se pudo completar la accion RAG."),
      response.status,
      data
    )
  }

  return data
}

export function getRagDocuments() {
  return requestRag("/api/documents", {
    method: "GET",
  })
}

export function getRagSessions() {
  return requestRag("/api/rag/sessions", {
    method: "GET",
  })
}

export function createRagSession(payload: CreateRagSessionPayload) {
  return requestRag("/api/rag/sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function updateRagSessionTitle(sessionId: string, title: string) {
  return requestRag(`/api/rag/sessions/${encodeURIComponent(sessionId)}`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  })
}

export function deleteRagSession(sessionId: string) {
  return requestRag(`/api/rag/sessions/${encodeURIComponent(sessionId)}`, {
    method: "DELETE",
  })
}

export function deleteRagMessage(messageId: string) {
  return requestRag(`/api/rag/messages/${encodeURIComponent(messageId)}`, {
    method: "DELETE",
  })
}

export function getRagSessionMessages(sessionId: string) {
  return requestRag(
    `/api/rag/sessions/${encodeURIComponent(sessionId)}/messages`,
    {
      method: "GET",
    }
  )
}

export function sendRagMessage(
  sessionId: string,
  payload: SendRagMessagePayload
) {
  return requestRag(
    `/api/rag/sessions/${encodeURIComponent(sessionId)}/messages`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  )
}

export function regenerateRagResponse(sessionId: string) {
  return requestRag(
    `/api/rag/sessions/${encodeURIComponent(sessionId)}/regenerate`,
    {
      method: "POST",
    }
  )
}
