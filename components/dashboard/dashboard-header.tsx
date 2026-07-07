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

type HeaderContent = {
  eyebrow: string
  title: string
  description: string
  icon: ElementType
}

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
      description: "Administra tus PDFs antes de usarlos en una sala de estudio.",
      icon: FileText,
    }
  }

  if (pathname === "/dashboard/chats") {
    return {
      eyebrow: "Chats",
      title: "Salas de estudio",
      description:
        "Crea sesiones RAG y conversa con la IA usando documentos específicos.",
      icon: MessageCircle,
    }
  }

  if (pathname.startsWith("/dashboard/chats/")) {
    const sessionId = pathname.split("/").pop() ?? "sesion"

    return {
      eyebrow: "Sala de estudio",
      title: formatSessionName(sessionId),
      description: "Haz preguntas sobre los documentos vinculados a esta sesión.",
      icon: Sparkles,
    }
  }

  return {
    eyebrow: "Panel principal",
    title: "Tu espacio de estudio inteligente",
    description: "Organiza documentos, crea sesiones y estudia con apoyo de IA.",
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

export function DashboardHeader() {
  const pathname = usePathname()
  const router = useRouter()

  const [user, setUser] = useState<AuthUser | null>(null)
  const [isUserLoading, setIsUserLoading] = useState(true)

  const content = getHeaderContent(pathname)
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