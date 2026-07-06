"use client";

import { usePathname } from "next/navigation";
import { FileText, MessageCircle, Sparkles } from "lucide-react";

type HeaderContent = {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ElementType;
};

function formatSessionName(sessionId: string) {
  return decodeURIComponent(sessionId)
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getHeaderContent(pathname: string): HeaderContent {
  if (pathname === "/dashboard/biblioteca") {
    return {
      eyebrow: "Biblioteca",
      title: "Mis documentos",
      description:
        "Administra tus PDFs antes de usarlos en una sala de estudio.",
      icon: FileText,
    };
  }

  if (pathname === "/dashboard/chats") {
    return {
      eyebrow: "Chats",
      title: "Salas de estudio",
      description:
        "Crea sesiones RAG y conversa con la IA usando documentos específicos.",
      icon: MessageCircle,
    };
  }

  if (pathname.startsWith("/dashboard/chats/")) {
    const sessionId = pathname.split("/").pop() ?? "sesion";

    return {
      eyebrow: "Sala de estudio",
      title: formatSessionName(sessionId),
      description:
        "Haz preguntas sobre los documentos vinculados a esta sesión.",
      icon: Sparkles,
    };
  }

  return {
    eyebrow: "Panel principal",
    title: "Tu espacio de estudio inteligente",
    description:
      "Organiza documentos, crea sesiones y estudia con apoyo de IA.",
    icon: Sparkles,
  };
}

export function DashboardHeader() {
  const pathname = usePathname();
  const content = getHeaderContent(pathname);
  const Icon = content.icon;

  return (
    <header className="border-b border-slate-200 bg-white px-6 py-4 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Icon className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-medium text-blue-600">
              {content.eyebrow}
            </p>

            <h1 className="text-xl font-bold text-slate-950">
              {content.title}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {content.description}
            </p>
          </div>
        </div>

        <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 sm:block">
          NexaBot · Campus IA
        </div>
      </div>
    </header>
  );
}