"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, MessageCircle, Pencil, Trash2, X } from "lucide-react"

export type SessionCardData = {
  id: string
  title: string
  documents: number | null
  updatedAt: string
}

type SessionCardProps = {
  session: SessionCardData
  isMutating?: boolean
  onDelete?: (sessionId: string) => Promise<void> | void
  onRename?: (sessionId: string, title: string) => Promise<void> | void
}

export function SessionCard({
  session,
  isMutating = false,
  onDelete,
  onRename,
}: SessionCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(session.title)

  const handleRename = async () => {
    const nextTitle = title.trim()

    if (!nextTitle || nextTitle === session.title) {
      setTitle(session.title)
      setIsEditing(false)
      return
    }

    await onRename?.(session.id, nextTitle)
    setIsEditing(false)
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <Link href={`/dashboard/chats/${session.id}`} className="block flex-1">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <MessageCircle className="h-5 w-5" />
          </div>

          <h2 className="font-semibold text-slate-950">
            {session.title}
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            {session.documents === null
              ? "Documentos vinculados"
              : `${session.documents} documento(s) vinculados`}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Ultima actividad: {session.updatedAt}
          </p>
        </Link>

        <div className="flex shrink-0 gap-1">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => void handleRename()}
                disabled={isMutating}
                className="rounded-lg p-2 text-green-600 hover:bg-green-50 disabled:opacity-50"
                aria-label="Guardar nombre"
              >
                <Check className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setTitle(session.title)
                  setIsEditing(false)
                }}
                disabled={isMutating}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                aria-label="Cancelar renombrado"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                disabled={isMutating}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-950 disabled:opacity-50"
                aria-label="Renombrar sala"
              >
                <Pencil className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => void onDelete?.(session.id)}
                disabled={isMutating}
                className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-50"
                aria-label="Eliminar sala"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="mt-4">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 outline-none transition focus:ring-2 focus:ring-blue-600/20"
            aria-label="Nuevo nombre de la sala"
          />
        </div>
      )}
    </article>
  )
}
