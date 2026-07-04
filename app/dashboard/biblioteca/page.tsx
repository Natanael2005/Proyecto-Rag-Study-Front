import { Download, FileText, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";

const mockDocuments = [
  {
    id: 1,
    name: "Apuntes de Historia.pdf",
    size: "2.4 MB",
    uploadedAt: "Hoy",
  },
  {
    id: 2,
    name: "Unidad 1 - Base de datos.pdf",
    size: "1.8 MB",
    uploadedAt: "Ayer",
  },
  {
    id: 3,
    name: "Introducción a RAG.pdf",
    size: "3.1 MB",
    uploadedAt: "Hace 3 días",
  },
];

export default function BibliotecaPage() {
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
            Administra tus documentos. Después podrás seleccionar algunos de ellos para crear una sala de estudio.
          </p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Subir PDF
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mockDocuments.map((document) => (
          <article
            key={document.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FileText className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-950">
                    {document.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {document.size} · Subido {document.uploadedAt}
                  </p>
                </div>
              </div>

              <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-950">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                <Download className="h-4 w-4" />
              </button>

              <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                <Pencil className="h-4 w-4" />
              </button>

              <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}