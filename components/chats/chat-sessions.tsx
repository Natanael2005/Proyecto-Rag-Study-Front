"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, RefreshCw } from "lucide-react"
import {
  CreateSessionModal,
  type DocumentOption,
} from "@/components/chats/create-session-modal"
import {
  SessionCard,
  type SessionCardData,
} from "@/components/chats/session-card"
import {
  createRagSession,
  deleteRagSession,
  getRagDocuments,
  getRagSessions,
  updateRagSessionTitle,
  type RagSession,
} from "@/lib/rag-api"

type ApiRecord = Record<string, unknown>

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null
}

function getString(value: unknown) {
  return typeof value === "string" ? value : ""
}

function pickArray(data: unknown, keys: string[]) {
  if (Array.isArray(data)) {
    return data
  }

  if (!isRecord(data)) {
    return []
  }

  return keys.map((key) => data[key]).find(Array.isArray) ?? []
}

function getNumber(value: unknown) {
  return typeof value === "number" ? value : null
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

function normalizeSession(session: unknown, index: number): SessionCardData {
  if (!isRecord(session)) {
    return {
      id: String(index),
      title: `Sala ${index + 1}`,
      documents: null,
      updatedAt: "recientemente",
    }
  }

  const documentIds = pickArray(session.document_ids, [])
  const documents = pickArray(session.documents, [])
  const documentCount =
    getNumber(session.document_count) ??
    getNumber(session.documents_count) ??
    getNumber(session.total_documents) ??
    (documentIds.length > 0
      ? documentIds.length
      : documents.length > 0
        ? documents.length
        : null)

  return {
    id: getString(session.id) || getString(session.session_id) || String(index),
    title:
      getString(session.title) ||
      getString(session.name) ||
      `Sala ${index + 1}`,
    documents: documentCount,
    updatedAt: formatDate(session.updated_at ?? session.created_at),
  }
}

function normalizeSessions(data: unknown) {
  return pickArray(data, ["sesiones", "sessions", "data", "items", "results"]).map(
    normalizeSession
  )
}

function normalizeDocument(document: unknown, index: number): DocumentOption {
  if (!isRecord(document)) {
    return {
      id: String(index),
      name: `Documento ${index + 1}`,
    }
  }

  return {
    id:
      getString(document.id) ||
      getString(document.document_id) ||
      getString(document.uuid) ||
      String(index),
    name:
      getString(document.title) ||
      getString(document.name) ||
      getString(document.filename) ||
      getString(document.file_name) ||
      `Documento ${index + 1}`,
  }
}

function normalizeDocuments(data: unknown) {
  return pickArray(data, ["documents", "documentos", "data", "items", "results"]).map(
    normalizeDocument
  )
}

function extractCreatedSession(data: unknown): RagSession | null {
  if (!isRecord(data)) {
    return null
  }

  const session = data.session ?? data.sesion ?? data.data

  if (isRecord(session)) {
    return session as RagSession
  }

  if (getString(data.id)) {
    return data as RagSession
  }

  return null
}

export function ChatSessions() {
  const router = useRouter()

  const [sessions, setSessions] = useState<SessionCardData[]>([])
  const [documents, setDocuments] = useState<DocumentOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [mutatingSessionId, setMutatingSessionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setError(null)

      const [sessionsData, documentsData] = await Promise.all([
        getRagSessions(),
        getRagDocuments(),
      ])

      setSessions(normalizeSessions(sessionsData))
      setDocuments(normalizeDocuments(documentsData))
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudieron cargar las salas de estudio."

      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const loadInitialData = async () => {
      try {
        setError(null)

        const [sessionsData, documentsData] = await Promise.all([
          getRagSessions(),
          getRagDocuments(),
        ])

        if (!isMounted) return

        setSessions(normalizeSessions(sessionsData))
        setDocuments(normalizeDocuments(documentsData))
      } catch (error) {
        if (!isMounted) return

        const message =
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las salas de estudio."

        setError(message)
      } finally {
        if (!isMounted) return

        setIsLoading(false)
      }
    }

    void loadInitialData()

    return () => {
      isMounted = false
    }
  }, [])

  const handleCreateSession = async ({
    title,
    documentIds,
  }: {
    title: string
    documentIds: string[]
  }) => {
    setIsCreating(true)

    try {
      const data = await createRagSession({
        title,
        document_ids: documentIds,
      })
      const createdSession = extractCreatedSession(data)

      await loadData()

      if (createdSession?.id) {
        router.push(`/dashboard/chats/${createdSession.id}`)
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    const shouldDelete = window.confirm(
      "Eliminar esta sala tambien borrara sus mensajes."
    )

    if (!shouldDelete) return

    try {
      setMutatingSessionId(sessionId)
      setError(null)
      await deleteRagSession(sessionId)
      setSessions((currentSessions) =>
        currentSessions.filter((session) => session.id !== sessionId)
      )
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo eliminar la sala."

      setError(message)
    } finally {
      setMutatingSessionId(null)
    }
  }

  const handleRenameSession = async (sessionId: string, title: string) => {
    try {
      setMutatingSessionId(sessionId)
      setError(null)
      await updateRagSessionTitle(sessionId, title)
      setSessions((currentSessions) =>
        currentSessions.map((session) =>
          session.id === sessionId ? { ...session, title } : session
        )
      )
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo renombrar la sala."

      setError(message)
    } finally {
      setMutatingSessionId(null)
    }
  }

  return (
    <section>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Chats
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Salas de estudio
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Crea una sesion, selecciona los PDFs que quieres usar y conversa con
            la IA sobre ese material.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={isLoading || isCreating}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </button>

          <CreateSessionModal
            documents={documents}
            isCreating={isCreating}
            onCreate={handleCreateSession}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-56 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Cargando salas...
        </div>
      ) : sessions.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isMutating={mutatingSessionId === session.id}
              onDelete={handleDeleteSession}
              onRename={handleRenameSession}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-slate-950">
            Aun no tienes salas
          </h2>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Crea una sala seleccionando uno o varios PDFs de tu biblioteca.
          </p>
        </div>
      )}
    </section>
  )
}
