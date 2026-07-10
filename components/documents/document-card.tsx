"use client"

import { useRef, useState } from "react"
import {
  Download,
  FileText,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react"

export type DocumentCardData = {
  id: number | string
  name: string
  size: string
  uploadedAt: string
}

export type DocumentAction = "download" | "rename" | "delete"

type DocumentCardProps = {
  document: DocumentCardData
  busyAction?: DocumentAction | null
  onDelete?: (document: DocumentCardData) => void
  onDownload?: (document: DocumentCardData) => void
  onRename?: (document: DocumentCardData) => void
}

export function DocumentCard({
  document,
  busyAction = null,
  onDelete,
  onDownload,
  onRename,
}: DocumentCardProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isBusy = busyAction !== null

  const handleAction = (
    callback: ((document: DocumentCardData) => void) | undefined
  ) => {
    setIsMenuOpen(false)
    callback?.(document)
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FileText className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h2
              className="truncate font-semibold text-slate-950"
              title={document.name}
            >
              {document.name}
            </h2>

            <p className="mt-1 truncate text-sm text-slate-500">
              {document.size} - Subido {document.uploadedAt}
            </p>
          </div>
        </div>

        <div
          ref={menuRef}
          className="relative shrink-0"
          onBlur={(event) => {
            if (!menuRef.current?.contains(event.relatedTarget)) {
              setIsMenuOpen(false)
            }
          }}
        >
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
            aria-label="Abrir acciones del documento"
            disabled={isBusy}
            onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
          >
            {isBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreVertical className="h-4 w-4" />
            )}
          </button>

          {isMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-10 z-20 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl shadow-slate-900/10"
            >
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleAction(onDownload)}
              >
                <Download className="h-4 w-4" />
                Descargar
              </button>

              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleAction(onRename)}
              >
                <Pencil className="h-4 w-4" />
                Renombrar
              </button>

              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm font-medium text-red-500 hover:bg-red-50"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleAction(onDelete)}
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
