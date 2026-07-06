import Link from "next/link";
import { MessageCircle, MoreVertical } from "lucide-react";

export type SessionCardData = {
  id: string;
  title: string;
  documents: number;
  updatedAt: string;
};

type SessionCardProps = {
  session: SessionCardData;
};

export function SessionCard({ session }: SessionCardProps) {
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
            {session.documents} documento(s) vinculados
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Última actividad: {session.updatedAt}
          </p>
        </Link>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-950"
          aria-label="Más opciones"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}