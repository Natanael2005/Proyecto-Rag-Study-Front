import Link from "next/link";
import { MessageCircle, MoreVertical, Plus } from "lucide-react";

const mockSessions = [
  {
    id: "historia",
    title: "Repaso de Historia",
    documents: 2,
    updatedAt: "Hoy",
  },
  {
    id: "base-datos",
    title: "Base de datos Unidad 1",
    documents: 1,
    updatedAt: "Ayer",
  },
];

export default function ChatsPage() {
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
            Crea una sesión, selecciona los PDFs que quieres usar y conversa con la IA sobre ese material.
          </p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Nuevo chat
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mockSessions.map((session) => (
          <article
            key={session.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <Link href={`/dashboard/chats/${session.id}`} className="block flex-1">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <MessageCircle className="h-5 w-5" />
                </div>

                <h2 className="font-semibold text-slate-950">
                  {session.title}
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                  {session.documents} documento(s) vinculados
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Última actividad: {session.updatedAt}
                </p>
              </Link>

              <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-950">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}