import Link from "next/link";
import { GraduationCap, MessageCircle, Users } from "lucide-react";

export function DashboardSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-5 md:block">
      <Link href="/dashboard" className="mb-8 flex items-center gap-3">
        <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-slate-900 shadow-md">
          <div className="absolute left-0 top-0 h-full w-full translate-x-2 -translate-y-2 rounded-full bg-yellow-300 opacity-20 blur-xl" />
          <GraduationCap className="relative z-10 h-5 w-5 text-white" />
        </div>

        <div>
          <p className="text-lg font-bold leading-none text-slate-950">
            NexaBot
          </p>
          <p className="mt-1 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-blue-600">
            Campus IA
          </p>
        </div>
      </Link>

      <nav className="flex flex-col gap-2">
        <Link
          href="/dashboard/equipos"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-950"
        >
          <Users className="h-4 w-4" />
          Equipos
        </Link>

        <Link
          href="/dashboard/chats"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-950"
        >
          <MessageCircle className="h-4 w-4" />
          Chats
        </Link>
      </nav>
    </aside>
  );
}