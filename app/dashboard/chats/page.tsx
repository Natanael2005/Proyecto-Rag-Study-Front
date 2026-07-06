import { CreateSessionModal } from "@/components/chats/create-session-modal";
import {
  SessionCard,
  type SessionCardData,
} from "@/components/chats/session-card";

const mockSessions: SessionCardData[] = [
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

const mockDocuments = [
  {
    id: 1,
    name: "Apuntes de Historia.pdf",
  },
  {
    id: 2,
    name: "Unidad 1 - Base de datos.pdf",
  },
  {
    id: 3,
    name: "Introducción a RAG.pdf",
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

        <CreateSessionModal documents={mockDocuments} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mockSessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </section>
  );
}