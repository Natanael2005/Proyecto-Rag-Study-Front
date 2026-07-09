"use client"

import { useState } from "react"
import { FileText, Loader2, Plus, X } from "lucide-react"

export type DocumentOption = {
  id: number | string
  name: string
}

type CreateSessionModalProps = {
  documents: DocumentOption[]
  isCreating?: boolean
  onCreate: (payload: {
    title: string
    documentIds: string[]
  }) => Promise<void> | void
}

export function CreateSessionModal({
  documents,
  isCreating = false,
  onCreate,
}: CreateSessionModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [sessionTitle, setSessionTitle] = useState("")
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<Array<number | string>>([])
  const [error, setError] = useState<string | null>(null)

  const canCreateSession =
    sessionTitle.trim().length > 0 && selectedDocumentIds.length > 0 && !isCreating

  const toggleDocument = (documentId: number | string) => {
    setSelectedDocumentIds((currentDocuments) =>
      currentDocuments.includes(documentId)
        ? currentDocuments.filter((id) => id !== documentId)
        : [...currentDocuments, documentId]
    )
  }

  const closeModal = () => {
    setIsOpen(false)
    setSessionTitle("")
    setSelectedDocumentIds([])
    setError(null)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!canCreateSession) return

    try {
      setError(null)

      await onCreate({
        title: sessionTitle.trim(),
        documentIds: selectedDocumentIds.map(String),
      })

      closeModal()
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo crear la sala de estudio."

      setError(message)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
      >
        <Plus className="h-4 w-4" />
        Nuevo chat
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 p-6">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Nueva sesion RAG
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  Crear sala de estudio
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Escribe un titulo y selecciona los PDFs que quieres usar en este chat.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isCreating}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950 disabled:opacity-50"
                aria-label="Cerrar modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="mb-5">
                <label
                  htmlFor="session-title"
                  className="text-[10px] font-semibold uppercase tracking-wider text-slate-950"
                >
                  Titulo de la sesion
                </label>

                <input
                  id="session-title"
                  value={sessionTitle}
                  onChange={(event) => setSessionTitle(event.target.value)}
                  disabled={isCreating}
                  placeholder="Ej. Repaso de Historia"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60"
                />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-950">
                  Documentos disponibles
                </p>

                <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
                  {documents.length > 0 ? (
                    documents.map((document) => {
                      const isSelected = selectedDocumentIds.includes(document.id)

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
                            onChange={() => toggleDocument(document.id)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600"
                          />

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                            <FileText className="h-5 w-5" />
                          </div>

                          <span className="text-sm font-medium text-slate-800">
                            {document.name}
                          </span>
                        </label>
                      )
                    })
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                      Sube PDFs en biblioteca antes de crear una sala.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isCreating}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={!canCreateSession}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear chat"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
