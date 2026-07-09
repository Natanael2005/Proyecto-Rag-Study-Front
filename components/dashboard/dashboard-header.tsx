"use client"

import type { ElementType } from "react"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { FileText, MessageCircle, Sparkles } from "lucide-react"
import {
  ApiRequestError,
  getCurrentUser,
  refreshSession,
  type AuthUser,
} from "@/lib/auth-api"
import { getRagSessions } from "@/lib/rag-api"

type HeaderContent = {
  eyebrow: string
  title: string
  description: string
  icon: ElementType
}

type ApiRecord = Record<string, unknown>

function formatSessionName(sessionId: string) {
  return decodeURIComponent(sessionId)
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function getHeaderContent(pathname: string): HeaderContent {
  if (pathname === "/dashboard/biblioteca") {
    return {
      eyebrow: "Biblioteca",
      title: "Mis documentos",
      description: "Administra tus PDFs antes de usarlos en una conversacion.",
      icon: FileText,
    }
  }

  if (pathname === "/dashboard/chats") {
    return {
      eyebrow: "Chats",
      title: "Conversaciones",
      description:
        "Crea chats, revisa el historial y conversa con la IA usando tus PDFs.",
      icon: MessageCircle,
    }
  }

  if (pathname.startsWith("/dashboard/chats/")) {
    const sessionId = pathname.split("/").pop() ?? "conversacion"

    return {
      eyebrow: "Conversacion",
      title: formatSessionName(sessionId),
      description: "Haz preguntas sobre los documentos vinculados a este chat.",
      icon: Sparkles,
    }
  }

  return {
    eyebrow: "Panel principal",
    title: "Tu espacio de estudio inteligente",
    description: "Organiza documentos, crea conversaciones y estudia con apoyo de IA.",
    icon: Sparkles,
  }
}

function getUserDisplayName(user: AuthUser | null) {
  if (!user) return "Usuario"

  const fullName = `${user.first_name} ${user.last_name}`.trim()

  return fullName || user.email
}

function getRoleLabel(role?: string) {
  if (role === "student") return "Alumno"
  if (role === "teacher") return "Profesor"

  return role ?? "Cuenta"
}

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null
}

function getString(value: unknown) {
  return typeof value === "string" ? value : ""
}

function pickSessions(data: unknown) {
  if (Array.isArray(data)) {
    return data
  }

  if (!isRecord(data)) {
    return []
  }

  return [data.sesiones, data.sessions, data.data, data.items, data.results].find(
    Array.isArray
  ) ?? []
}

function findSessionTitle(data: unknown, sessionId: string) {
  const session = pickSessions(data).find(
    (item) =>
      isRecord(item) &&
      (getString(item.id) === sessionId || getString(item.session_id) === sessionId)
  )

  return isRecord(session)
    ? getString(session.title) || getString(session.name)
    : ""
}

export function DashboardHeader() {
  const pathname = usePathname()
  const router = useRouter()

  const [user, setUser] = useState<AuthUser | null>(null)
  const [isUserLoading, setIsUserLoading] = useState(true)
  const [activeSessionTitle, setActiveSessionTitle] = useState("")
  const [isSessionTitleLoading, setIsSessionTitleLoading] = useState(false)

  const content = getHeaderContent(pathname)
  const isChatSessionPath = pathname.startsWith("/dashboard/chats/")
  const visibleTitle = isChatSessionPath
    ? isSessionTitleLoading
      ? "Cargando conversacion..."
      : activeSessionTitle || "Conversacion"
    : content.title
  const Icon = content.icon
  const displayName = isUserLoading ? "Cargando..." : getUserDisplayName(user)
  const roleLabel = user ? getRoleLabel(user.role) : "Cuenta"

  useEffect(() => {
    let isMounted = true

    const loadUser = async () => {
      try {
        setIsUserLoading(true)

        const currentUser = await getCurrentUser()

        if (!isMounted) return

        setUser(currentUser)
      } catch (error) {
        if (error instanceof ApiRequestError && error.status === 401) {
          try {
            await refreshSession()

            const currentUser = await getCurrentUser()

            if (!isMounted) return

            setUser(currentUser)
          } catch {
            if (!isMounted) return

            router.replace("/auth/login")
          }
        } else {
          if (!isMounted) return

          setUser(null)
        }
      } finally {
        if (!isMounted) return

        setIsUserLoading(false)
      }
    }

    void loadUser()

    return () => {
      isMounted = false
    }
  }, [router])

  useEffect(() => {
    let isMounted = true

    const sessionId = pathname.startsWith("/dashboard/chats/")
      ? pathname.split("/").pop()
      : null

    if (!sessionId) return

    const loadSessionTitle = async () => {
      try {
        setIsSessionTitleLoading(true)
        const sessionsData = await getRagSessions()

        if (!isMounted) return

        setActiveSessionTitle(findSessionTitle(sessionsData, sessionId))
      } catch {
        if (!isMounted) return

        setActiveSessionTitle("")
      } finally {
        if (!isMounted) return

        setIsSessionTitleLoading(false)
      }
    }

    void loadSessionTitle()

    return () => {
      isMounted = false
    }
  }, [pathname])

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
              {visibleTitle}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {content.description}
            </p>
          </div>
        </div>

        <div className="hidden flex-col items-end sm:flex">
          <span className="text-sm font-semibold text-slate-950">
            {displayName}
          </span>

          <span className="text-xs font-medium text-slate-500">
            {roleLabel}
          </span>
        </div>
      </div>
    </header>
  )
}
