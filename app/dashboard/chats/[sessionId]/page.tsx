import { RotateCcw, Send } from "lucide-react";

type ChatSessionPageProps = {
  params: Promise<{
    sessionId: string;
  }>;
};

const mockMessages = [
  {
    id: 1,
    role: "assistant",
    content: "Hola, ya cargué los documentos de esta sala. ¿Qué quieres estudiar?",
  },
  {
    id: 2,
    role: "user",
    content: "Explícame el tema principal del documento.",
  },
  {
    id: 3,
    role: "assistant",
    content: "El documento explica cómo separar la biblioteca de documentos y las sesiones RAG para que cada chat use PDFs específicos.",
  },
];

export default async function ChatSessionPage({ params }: ChatSessionPageProps) {
  const { sessionId } = await params;

  return (
    <section className="flex h-[calc(100vh-9rem)] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 px-5 py-4">
        <p className="text-sm font-medium text-blue-600">
          Sala de estudio
        </p>
        <h1 className="text-xl font-bold text-slate-950">
          {sessionId}
        </h1>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {mockMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 p-4">
        <div className="mb-3 flex justify-end">
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            <RotateCcw className="h-4 w-4" />
            Regenerar
          </button>
        </div>

        <form className="flex gap-3">
          <input
            placeholder="Escribe tu pregunta..."
            className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:ring-2 focus:ring-blue-600/20"
          />

          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
            Enviar
          </button>
        </form>
      </div>
    </section>
  );
}