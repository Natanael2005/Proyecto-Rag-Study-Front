"use client";

import { useState } from "react";
import { FileText, Plus, X } from "lucide-react";

type DocumentOption = {
  id: number | string;
  name: string;
};

type CreateSessionModalProps = {
  documents: DocumentOption[];
};

export function CreateSessionModal({ documents }: CreateSessionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("");
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<Array<number | string>>([]);

  const canCreateSession = sessionTitle.trim().length > 0 && selectedDocumentIds.length > 0;

  const toggleDocument = (documentId: number | string) => {
    setSelectedDocumentIds((currentDocuments) =>
      currentDocuments.includes(documentId)
        ? currentDocuments.filter((id) => id !== documentId)
        : [...currentDocuments, documentId]
    );
  };

  const closeModal = () => {
    setIsOpen(false);
    setSessionTitle("");
    setSelectedDocumentIds([]);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canCreateSession) return;

    closeModal();
  };

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
                  Nueva sesión RAG
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  Crear sala de estudio
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Escribe un título y selecciona los PDFs que quieres usar en este chat.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                aria-label="Cerrar modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-5">
                <label
                  htmlFor="session-title"
                  className="text-[10px] font-semibold uppercase tracking-wider text-slate-950"
                >
                  Título de la sesión
                </label>

                <input
                  id="session-title"
                  value={sessionTitle}
                  onChange={(event) => setSessionTitle(event.target.value)}
                  placeholder="Ej. Repaso de Historia"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-950">
                  Documentos disponibles
                </p>

                <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
                  {documents.map((document) => {
                    const isSelected = selectedDocumentIds.includes(document.id);

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
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={!canCreateSession}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Crear chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}