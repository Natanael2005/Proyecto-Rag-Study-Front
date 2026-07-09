import { ApiRequestError } from "@/lib/auth-api"

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

async function requestDocuments(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(endpoint, {
    ...options,
    credentials: "include",
  })

  const data = await parseResponseData(response)

  if (!response.ok) {
    throw new ApiRequestError(
      getErrorMessage(data, "No se pudo completar la accion de documentos."),
      response.status,
      data
    )
  }

  return data
}

export function getDocuments() {
  return requestDocuments("/api/documents", {
    method: "GET",
  })
}

export function uploadDocument(file: File) {
  const formData = new FormData()
  formData.append("file", file)

  return requestDocuments("/api/documents", {
    method: "POST",
    body: formData,
  })
}
