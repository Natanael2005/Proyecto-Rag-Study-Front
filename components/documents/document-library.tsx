"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, Plus, RefreshCw, UploadCloud } from "lucide-react"
import {
  DocumentCard,
  type DocumentAction,
  type DocumentCardData,
} from "@/components/documents/document-card"
import {
  deleteDocument,
  downloadDocument,
  getDocuments,
  renameDocument,
  uploadDocument,
} from "@/lib/documents-api"

type ApiDocument = Record<string, unknown>

function isRecord(value: unknown): value is ApiDocument {
  return typeof value === "object" && value !== null
}

function getString(value: unknown) {
  return typeof value === "string" ? value : ""
}

function getNumber(value: unknown) {
  return typeof value === "number" ? value : null
}

function formatBytes(value: unknown) {
  const bytes = getNumber(value)

  if (!bytes || bytes <= 0) {
    return "PDF"
  }

  const units = ["B", "KB", "MB", "GB"]
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  )
  const size = bytes / 1024 ** exponent

  return `${size.toFixed(size >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`
}

function formatDate(value: unknown) {
  const dateValue = getString(value)

  if (!dateValue) {
    return "recientemente"
  }

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return dateValue
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

function pickDocuments(data: unknown): unknown[] {
  if (Array.isArray(data)) {
    return data
  }

  if (!isRecord(data)) {
    return []
  }

  const candidates = [
    data.documents,
    data.documentos,
    data.Documents,
    data.Documentos,
    data.data,
    data.items,
    data.results,
  ]

  return candidates.find(Array.isArray) ?? []
}

function normalizeDocument(document: unknown, index: number): DocumentCardData {
  if (!isRecord(document)) {
    return {
      id: index,
      name: `Documento ${index + 1}`,
      size: "PDF",
      uploadedAt: "recientemente",
    }
  }

  const id =
    getString(document.id) ||
    getString(document.document_id) ||
    getString(document.documentId) ||
    getString(document.uuid) ||
    index

  const name =
    getString(document.title) ||
    getString(document.Title) ||
    getString(document.name) ||
    getString(document.Name) ||
    getString(document.filename) ||
    getString(document.file_name) ||
    getString(document.fileName) ||
    `Documento ${index + 1}`

  return {
    id,
    name,
    size: formatBytes(document.size ?? document.file_size ?? document.bytes),
    uploadedAt: formatDate(
      document.uploaded_at ?? document.created_at ?? document.createdAt
    ),
  }
}

function normalizeDocuments(data: unknown) {
  const pickedDocuments = pickDocuments(data)

  return pickedDocuments.map(normalizeDocument)
}

export function DocumentLibrary() {
  const inputRef = useRef<HTMLInputElement>(null)

  const [documents, setDocuments] = useState<DocumentCardData[]>([])
  const [busyDocument, setBusyDocument] = useState<{
    id: DocumentCardData["id"]
    action: DocumentAction
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadDocuments = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const data = await getDocuments()
      setDocuments(normalizeDocuments(data))
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo cargar la biblioteca de documentos."

      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const loadInitialDocuments = async () => {
      try {
        const data = await getDocuments()

        if (!isMounted) return

        setDocuments(normalizeDocuments(data))
      } catch (error) {
        if (!isMounted) return

        const message =
          error instanceof Error
            ? error.message
            : "No se pudo cargar la biblioteca de documentos."

        setError(message)
      } finally {
        if (!isMounted) return

        setIsLoading(false)
      }
    }

    void loadInitialDocuments()

    return () => {
      isMounted = false
    }
  }, [])

  const runDocumentAction = async (
    document: DocumentCardData,
    action: DocumentAction,
    callback: () => Promise<void>
  ) => {
    try {
      setBusyDocument({ id: document.id, action })
      setError(null)
      setSuccessMessage(null)

      await callback()
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo completar la accion del documento."

      setError(message)
    } finally {
      setBusyDocument(null)
    }
  }

  const handleDownload = (document: DocumentCardData) => {
    void runDocumentAction(document, "download", () =>
      downloadDocument(document.id, document.name)
    )
  }

  const handleRename = (document: DocumentCardData) => {
    const nextTitle = window.prompt("Nuevo nombre del documento", document.name)
    const normalizedTitle = nextTitle?.trim()

    if (!normalizedTitle || normalizedTitle === document.name) {
      return
    }

    void runDocumentAction(document, "rename", async () => {
      await renameDocument(document.id, normalizedTitle)
      setSuccessMessage("Documento renombrado correctamente.")
      await loadDocuments()
    })
  }

  const handleDelete = (document: DocumentCardData) => {
    const shouldDelete = window.confirm(
      `Estas seguro de que quieres eliminar "${document.name}"?`
    )

    if (!shouldDelete) {
      return
    }

    void runDocumentAction(document, "delete", async () => {
      await deleteDocument(document.id)
      setSuccessMessage("Documento eliminado correctamente.")
      setDocuments((currentDocuments) =>
        currentDocuments.filter(
          (currentDocument) => currentDocument.id !== document.id
        )
      )
    })
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ""

    if (!file) return

    if (file.type !== "application/pdf") {
      setError("Selecciona un archivo PDF valido.")
      return
    }

    try {
      setIsUploading(true)
      setError(null)
      setSuccessMessage(null)

      await uploadDocument(file)
      setSuccessMessage("PDF subido y procesado correctamente.")
      await loadDocuments()
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo subir el PDF."

      setError(message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <section>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Biblioteca de documentos
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Mis PDFs
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Administra tus documentos. Despues podras seleccionar algunos de
            ellos para crear una sala de estudio.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => void loadDocuments()}
            disabled={isLoading || isUploading || busyDocument !== null}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading || busyDocument !== null}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando PDF...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Subir PDF
              </>
            )}
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-56 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Cargando documentos...
        </div>
      ) : documents.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {documents.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              busyAction={
                busyDocument?.id === document.id ? busyDocument.action : null
              }
              onDelete={handleDelete}
              onDownload={handleDownload}
              onRename={handleRename}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <UploadCloud className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-slate-950">
            Aun no tienes PDFs
          </h2>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Sube tu primer documento para que el backend RAG lo procese y lo
            deje listo para futuras salas de estudio.
          </p>
        </div>
      )}
    </section>
  )
}
