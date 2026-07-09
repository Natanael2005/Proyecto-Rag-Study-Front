import { Download, FileText, MoreVertical, Pencil, Trash2 } from "lucide-react"

export type DocumentCardData = {
  id: number | string
  name: string
  size: string
  uploadedAt: string
}

type DocumentCardProps = {
  document: DocumentCardData
}

export function DocumentCard({ document }: DocumentCardProps) {
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

        <button
          type="button"
          className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-950"
          aria-label="Mas opciones"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          aria-label="Descargar documento"
        >
          <Download className="h-4 w-4" />
        </button>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          aria-label="Renombrar documento"
        >
          <Pencil className="h-4 w-4" />
        </button>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
          aria-label="Eliminar documento"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  )
}
