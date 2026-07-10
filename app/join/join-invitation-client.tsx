"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { AlertCircle, CheckCircle2, Loader2, School } from "lucide-react"
import { ApiRequestError } from "@/lib/auth-api"
import { joinOrganization } from "@/lib/organizations-api"

type JoinInvitationClientProps = {
  code: string
}

type JoinStatus = "loading" | "success" | "unauthorized" | "error"

function getLoginHref(code: string) {
  const nextPath = code
    ? `/join?code=${encodeURIComponent(code)}`
    : "/dashboard/organizaciones"

  return `/auth/login?next=${encodeURIComponent(nextPath)}`
}

export function JoinInvitationClient({ code }: JoinInvitationClientProps) {
  const hasSubmittedRef = useRef(false)
  const [status, setStatus] = useState<JoinStatus>("loading")
  const [message, setMessage] = useState("Procesando tu invitacion...")

  const submitJoinRequest = useCallback(async () => {
    const normalizedCode = code.trim()

    if (!normalizedCode) {
      setStatus("error")
      setMessage("El enlace de invitacion no incluye un codigo valido.")
      return
    }

    try {
      setStatus("loading")
      setMessage("Enviando solicitud para unirte al salon...")

      await joinOrganization(normalizedCode)

      setStatus("success")
      setMessage(
        "Solicitud enviada. Quedaras en espera hasta que el profesor te acepte."
      )
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        setStatus("unauthorized")
        setMessage("Inicia sesion para aceptar esta invitacion.")
        return
      }

      setStatus("error")
      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudo procesar la invitacion."
      )
    }
  }, [code])

  useEffect(() => {
    if (hasSubmittedRef.current) return

    hasSubmittedRef.current = true
    void submitJoinRequest()
  }, [submitJoinRequest])

  const isLoading = status === "loading"
  const isSuccess = status === "success"
  const isUnauthorized = status === "unauthorized"

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/70">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${
            isSuccess
              ? "bg-green-50 text-green-600"
              : isUnauthorized || status === "error"
                ? "bg-red-50 text-red-600"
                : "bg-blue-50 text-blue-600"
          }`}
        >
          {isLoading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : isSuccess ? (
            <CheckCircle2 className="h-8 w-8" />
          ) : isUnauthorized ? (
            <School className="h-8 w-8" />
          ) : (
            <AlertCircle className="h-8 w-8" />
          )}
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          Invitacion a salon
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          {isLoading
            ? "Un momento..."
            : isSuccess
              ? "Solicitud enviada"
              : isUnauthorized
                ? "Necesitas iniciar sesion"
                : "No pudimos unir el salon"}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
          {message}
        </p>

        {code && (
          <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium text-slate-500">Codigo recibido</p>
            <p className="mt-1 font-mono text-sm font-semibold text-slate-950">
              {code}
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {isUnauthorized ? (
            <Link
              href={getLoginHref(code)}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Iniciar sesion
            </Link>
          ) : null}

          {status === "error" ? (
            <button
              type="button"
              onClick={() => void submitJoinRequest()}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Intentar de nuevo
            </button>
          ) : null}

          <Link
            href="/dashboard/organizaciones"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Ir a mis salones
          </Link>
        </div>
      </section>
    </main>
  )
}
