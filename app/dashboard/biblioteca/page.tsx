import {
  DocumentCard,
  type DocumentCardData,
} from "@/components/documents/document-card";
import { Plus } from "lucide-react";

const mockDocuments: DocumentCardData[] = [
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
          <DocumentCard key={document.id} document={document} />
        ))}
      </div>
    </section>
  );
}