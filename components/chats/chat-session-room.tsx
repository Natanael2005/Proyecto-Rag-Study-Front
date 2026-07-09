"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Check,
  Loader2,
  MessageCircle,
  Pencil,
  RotateCcw,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react"
import {
  ChatBubble,
  type ChatMessageRole,
} from "@/components/chats/chat-bubble"
import {
  CreateSessionModal,
  type DocumentOption,
} from "@/components/chats/create-session-modal"
import {
  createRagSession,
  deleteRagSession,
  getRagDocuments,
  getRagSessionMessages,
  getRagSessions,
  regenerateRagResponse,
  sendRagMessage,
  updateRagSessionTitle,
  type RagSession,
} from "@/lib/rag-api"

type ChatSessionRoomProps = {
  sessionId?: string
}

type ChatMessage = {
  id: string
  role: ChatMessageRole
  content: string
}

type SessionNavItem = {
  id: string
  title: string
  updatedAt: string
}

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

function normalizeRole(role: string): ChatMessageRole {
  return role === "human" || role === "user" ? "user" : "assistant"
}

function normalizeMessage(message: unknown, index: number): ChatMessage {
  if (!isRecord(message)) {
    return {
      id: String(index),
      role: "assistant",
      content: "",
    }
  }

  return {
    id: getString(message.id) || String(index),
    role: normalizeRole(getString(message.role)),
    content: getString(message.content),
  }
}

function normalizeMessages(data: unknown) {
  return pickArray(data, [
    "mensajes",
    "messages",
    "data",
    "items",
    "results",
  ])
    .map(normalizeMessage)
    .filter((message) => message.content)
}

function normalizeSession(session: unknown, index: number): SessionNavItem {
  if (!isRecord(session)) {
    return {
      id: String(index),
      title: `Conversacion ${index + 1}`,
      updatedAt: "recientemente",
    }
  }

  return {
    id: getString(session.id) || getString(session.session_id) || String(index),
    title:
      getString(session.title) ||
      getString(session.name) ||
      `Conversacion ${index + 1}`,
    updatedAt: formatDate(session.updated_at ?? session.created_at),
  }
}

function normalizeSessions(data: unknown) {
  return pickArray(data, [
    "sesiones",
    "sessions",
    "data",
    "items",
    "results",
  ]).map(normalizeSession)
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
  return pickArray(data, [
    "documents",
    "documentos",
    "data",
    "items",
    "results",
  ]).map(normalizeDocument)
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

function getResponseText(data: unknown) {
  if (typeof data === "string") {
    return data
  }

  if (!isRecord(data)) {
    return ""
  }

  return (
    getString(data.respuesta) ||
    getString(data.respuesta_regenerada) ||
    getString(data.answer) ||
    getString(data.response) ||
    getString(data.content)
  )
}

export function ChatSessionRoom({ sessionId }: ChatSessionRoomProps) {
  const router = useRouter()
  const bottomRef = useRef<HTMLDivElement>(null)

  const [sessions, setSessions] = useState<SessionNavItem[]>([])
  const [documents, setDocuments] = useState<DocumentOption[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [question, setQuestion] = useState("")
  const [conversationSearch, setConversationSearch] = useState("")
  const [pendingQuestion, setPendingQuestion] = useState("")
  const [setupTitle, setSetupTitle] = useState("")
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([])
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [isLoading, setIsLoading] = useState(Boolean(sessionId))
  const [isSidebarLoading, setIsSidebarLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isSetupOpen, setIsSetupOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [mutatingSessionId, setMutatingSessionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const activeSessionTitle = useMemo(
    () => sessions.find((session) => session.id === sessionId)?.title ?? "",
    [sessionId, sessions]
  )
  const filteredSessions = sessions.filter((session) =>
    session.title.toLowerCase().includes(conversationSearch.trim().toLowerCase())
  )

  const loadSidebarData = async () => {
    const [sessionsData, documentsData] = await Promise.all([
      getRagSessions(),
      getRagDocuments(),
    ])

    setSessions(normalizeSessions(sessionsData))
    setDocuments(normalizeDocuments(documentsData))
  }

  const loadMessages = async () => {
    if (!sessionId) {
      setMessages([])
      setIsLoading(false)
      return
    }

    try {
      setError(null)
      const data = await getRagSessionMessages(sessionId)
      setMessages(normalizeMessages(data))
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo cargar el chat."

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
        setIsLoading(Boolean(sessionId))
        const [sessionsData, documentsData, messagesData] = await Promise.all([
          getRagSessions(),
          getRagDocuments(),
          sessionId ? getRagSessionMessages(sessionId) : Promise.resolve(null),
        ])

        if (!isMounted) return

        setSessions(normalizeSessions(sessionsData))
        setDocuments(normalizeDocuments(documentsData))
        setMessages(sessionId ? normalizeMessages(messagesData) : [])
      } catch (error) {
        if (!isMounted) return

        const message =
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las conversaciones."

        setError(message)
      } finally {
        if (!isMounted) return

        setIsSidebarLoading(false)
        setIsLoading(false)
      }
    }

    void loadInitialData()

    return () => {
      isMounted = false
    }
  }, [sessionId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isSending, isRegenerating])

  const sendQuestionToSession = async (targetSessionId: string, text: string) => {
    const optimisticUserMessage: ChatMessage = {
      id: `local-user-${Date.now()}`,
      role: "user",
      content: text,
    }

    setIsSending(true)
    setError(null)
    setMessages((currentMessages) => [...currentMessages, optimisticUserMessage])

    try {
      const data = await sendRagMessage(targetSessionId, {
        mensaje: text,
      })
      const responseText = getResponseText(data)

      if (responseText) {
        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: `local-ai-${Date.now()}`,
            role: "assistant",
            content: responseText,
          },
        ])
      } else {
        await loadMessages()
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo enviar la pregunta."

      setError(message)
      setMessages((currentMessages) =>
        currentMessages.filter((message) => message.id !== optimisticUserMessage.id)
      )
    } finally {
      setIsSending(false)
    }
  }

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

      await loadSidebarData()

      if (createdSession?.id) {
        router.push(`/dashboard/chats/${createdSession.id}`)
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handleCreateFromDraft = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const title = setupTitle.trim()
    const firstQuestion = pendingQuestion.trim()

    if (!title || !firstQuestion || selectedDocumentIds.length === 0) return

    setIsCreating(true)

    try {
      const data = await createRagSession({
        title,
        document_ids: selectedDocumentIds,
      })
      const createdSession = extractCreatedSession(data)

      if (!createdSession?.id) {
        await loadSidebarData()
        setIsSetupOpen(false)
        return
      }

      setMessages([])
      setQuestion("")
      setIsSetupOpen(false)
      setSetupTitle("")
      setSelectedDocumentIds([])
      await loadSidebarData()
      router.push(`/dashboard/chats/${createdSession.id}`)
      await sendQuestionToSession(createdSession.id, firstQuestion)
      setPendingQuestion("")
    } finally {
      setIsCreating(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedQuestion = question.trim()

    if (!trimmedQuestion || isSending) return

    if (!sessionId) {
      setPendingQuestion(trimmedQuestion)
      setSetupTitle("")
      setSelectedDocumentIds([])
      setIsSetupOpen(true)
      return
    }

    setQuestion("")
    await sendQuestionToSession(sessionId, trimmedQuestion)
  }

  const handleRegenerate = async () => {
    if (!sessionId || isRegenerating || messages.length === 0) return

    try {
      setIsRegenerating(true)
      setError(null)

      const data = await regenerateRagResponse(sessionId)
      const responseText = getResponseText(data)

      if (responseText) {
        setMessages((currentMessages) => {
          const withoutLastAi = [...currentMessages]
          const lastAiIndex = withoutLastAi
            .map((message) => message.role)
            .lastIndexOf("assistant")

          if (lastAiIndex >= 0) {
            withoutLastAi.splice(lastAiIndex, 1)
          }

          return [
            ...withoutLastAi,
            {
              id: `local-regenerated-${Date.now()}`,
              role: "assistant",
              content: responseText,
            },
          ]
        })
      } else {
        await loadMessages()
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo regenerar la respuesta."

      setError(message)
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleRename = async (targetSessionId: string) => {
    const title = editingTitle.trim()

    if (!title) return

    try {
      setMutatingSessionId(targetSessionId)
      await updateRagSessionTitle(targetSessionId, title)
      setSessions((currentSessions) =>
        currentSessions.map((session) =>
          session.id === targetSessionId ? { ...session, title } : session
        )
      )
      setEditingSessionId(null)
      setEditingTitle("")
    } finally {
      setMutatingSessionId(null)
    }
  }

  const handleDelete = async (targetSessionId: string) => {
    const shouldDelete = window.confirm(
      "Eliminar esta conversacion tambien borrara sus mensajes."
    )

    if (!shouldDelete) return

    try {
      setMutatingSessionId(targetSessionId)
      await deleteRagSession(targetSessionId)
      setSessions((currentSessions) =>
        currentSessions.filter((session) => session.id !== targetSessionId)
      )

      if (targetSessionId === sessionId) {
        router.push("/dashboard/chats")
      }
    } finally {
      setMutatingSessionId(null)
    }
  }

  const toggleSetupDocument = (documentId: string) => {
    setSelectedDocumentIds((currentIds) =>
      currentIds.includes(documentId)
        ? currentIds.filter((id) => id !== documentId)
        : [...currentIds, documentId]
    )
  }

  return (
    <section className="grid h-[calc(100vh-9rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="flex min-h-0 flex-col border-b border-slate-200 bg-slate-50/80 p-4 lg:border-b-0 lg:border-r">
        <div className="mb-4">
          <CreateSessionModal
            documents={documents}
            isCreating={isCreating}
            onCreate={handleCreateSession}
          />
        </div>

        <label className="relative mb-4 block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={conversationSearch}
            onChange={(event) => setConversationSearch(event.target.value)}
            placeholder="Buscar conversaciones"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-950 outline-none transition focus:ring-2 focus:ring-blue-600/20"
          />
        </label>

        <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Recientes
        </div>

        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          {isSidebarLoading ? (
            <div className="flex items-center rounded-xl px-3 py-2 text-sm text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando...
            </div>
          ) : filteredSessions.length > 0 ? (
            filteredSessions.map((session) => {
              const isActive = session.id === sessionId
              const isEditing = editingSessionId === session.id

              return (
                <div
                  key={session.id}
                  className={`group rounded-xl px-3 py-2 transition ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-white hover:text-slate-950"
                  }`}
                >
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        value={editingTitle}
                        onChange={(event) => setEditingTitle(event.target.value)}
                        className="h-8 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-950 outline-none focus:ring-2 focus:ring-blue-600/20"
                        aria-label="Nuevo nombre de la conversacion"
                      />
                      <button
                        type="button"
                        onClick={() => void handleRename(session.id)}
                        disabled={mutatingSessionId === session.id}
                        className="rounded-lg p-1.5 text-green-600 hover:bg-green-50"
                        aria-label="Guardar nombre"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSessionId(null)
                          setEditingTitle("")
                        }}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                        aria-label="Cancelar edicion"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <Link
                        href={`/dashboard/chats/${session.id}`}
                        className="flex min-w-0 flex-1 items-start gap-2"
                      >
                        <MessageCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">
                            {session.title}
                          </span>
                          <span className="mt-0.5 block truncate text-xs font-normal text-slate-400">
                            {session.updatedAt}
                          </span>
                        </span>
                      </Link>
                      <div className="flex shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSessionId(session.id)
                            setEditingTitle(session.title)
                          }}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                          aria-label="Editar conversacion"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(session.id)}
                          disabled={mutatingSessionId === session.id}
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                          aria-label="Eliminar conversacion"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-3 text-sm text-slate-500">
              No hay conversaciones.
            </div>
          )}
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-col">
        {error && (
          <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando mensajes...
            </div>
          ) : sessionId && messages.length > 0 ? (
            messages.map((message) => (
              <ChatBubble
                key={message.id}
                role={message.role}
                content={message.content}
              />
            ))
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <h2 className="text-3xl font-semibold text-slate-950">
                ¿En que deberiamos centrarnos?
              </h2>
              <p className="mt-3 max-w-lg text-sm text-slate-500">
                Escribe una pregunta. Si no hay una conversacion abierta, te
                pedire el nombre y los PDFs asociados antes de iniciar.
              </p>
            </div>
          )}

          {(isSending || isRegenerating) && (
            <div className="flex justify-start">
              <div className="inline-flex items-center rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Pensando...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 flex justify-between gap-3">
            <span className="truncate text-sm font-medium text-slate-500">
              {activeSessionTitle || "Nueva conversacion"}
            </span>
            <button
              type="button"
              onClick={() => void handleRegenerate()}
              disabled={!sessionId || isLoading || isSending || isRegenerating || messages.length === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              Regenerar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              disabled={isLoading || isSending || isRegenerating}
              placeholder="Escribe tu pregunta..."
              className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={!question.trim() || isLoading || isSending || isRegenerating}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Enviar
            </button>
          </form>
        </div>
      </div>

      {isSetupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 p-6">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Nueva conversacion
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  Configura este chat
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Elige un nombre y los PDFs que usara la IA para responder tu
                  primera pregunta.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsSetupOpen(false)}
                disabled={isCreating}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950 disabled:opacity-50"
                aria-label="Cerrar modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFromDraft} className="p-6">
              <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {pendingQuestion}
              </div>

              <div className="mb-5">
                <label
                  htmlFor="conversation-title"
                  className="text-[10px] font-semibold uppercase tracking-wider text-slate-950"
                >
                  Nombre de la conversacion
                </label>
                <input
                  id="conversation-title"
                  value={setupTitle}
                  onChange={(event) => setSetupTitle(event.target.value)}
                  disabled={isCreating}
                  placeholder="Ej. Repaso del certificado"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60"
                />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-950">
                  PDFs asociados
                </p>

                <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
                  {documents.length > 0 ? (
                    documents.map((document) => {
                      const documentId = String(document.id)
                      const isSelected = selectedDocumentIds.includes(documentId)

                      return (
                        <label
                          key={document.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${
                            isSelected
                              ? "border-blue-200 bg-blue-50"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isCreating}
                            onChange={() => toggleSetupDocument(documentId)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600"
                          />
                          <span className="text-sm font-medium text-slate-800">
                            {document.name}
                          </span>
                        </label>
                      )
                    })
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                      Sube PDFs en biblioteca antes de crear una conversacion.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsSetupOpen(false)}
                  disabled={isCreating}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    isCreating ||
                    !setupTitle.trim() ||
                    selectedDocumentIds.length === 0
                  }
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear y preguntar"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
