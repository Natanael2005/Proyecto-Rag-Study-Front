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

function getDocumentEndpoint(documentId: string | number) {
  return `/api/documents/${encodeURIComponent(String(documentId))}`
}

function getFilenameFromContentDisposition(contentDisposition: string | null) {
  if (!contentDisposition) {
    return null
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)

  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1].replace(/"/g, ""))
  }

  const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i)

  return filenameMatch?.[1] ?? null
}

function getDownloadName(fallbackName: string, contentDisposition: string | null) {
  const backendFilename = getFilenameFromContentDisposition(contentDisposition)

  if (backendFilename) {
    return backendFilename
  }

  return fallbackName.replace(/\.pdf$/i, "") + ".txt"
}

async function getDownloadBlob(response: Response) {
  const contentType = response.headers.get("content-type") ?? ""

  if (!contentType.includes("application/json")) {
    return response.blob()
  }

  const data = await response.json().catch(() => null)
  const text = typeof data === "string" ? data : JSON.stringify(data, null, 2)

  return new Blob([text ?? ""], {
    type: "text/plain;charset=utf-8",
  })
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

export function deleteDocument(documentId: string | number) {
  return requestDocuments(getDocumentEndpoint(documentId), {
    method: "DELETE",
  })
}

export function renameDocument(documentId: string | number, title: string) {
  return requestDocuments(getDocumentEndpoint(documentId), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  })
}

export async function downloadDocument(
  documentId: string | number,
  fallbackName: string
) {
  const response = await fetch(`${getDocumentEndpoint(documentId)}/download`, {
    method: "GET",
    credentials: "include",
  })

  if (!response.ok) {
    const data = await parseResponseData(response)

    throw new ApiRequestError(
      getErrorMessage(data, "No se pudo descargar el documento."),
      response.status,
      data
    )
  }

  const blob = await getDownloadBlob(response)
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = getDownloadName(
    fallbackName,
    response.headers.get("content-disposition")
  )
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
