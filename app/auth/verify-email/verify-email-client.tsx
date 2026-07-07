"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { CheckCircle2, Loader2, MailWarning, XCircle } from "lucide-react"
import { AuthLayout } from "@/components/auth-layout"
import { verifyEmail } from "@/lib/auth-api"

type VerifyStatus = "loading" | "success" | "error"

type VerifyEmailClientProps = {
  token: string
}

export function VerifyEmailClient({ token }: VerifyEmailClientProps) {
  const hasVerifiedRef = useRef(false)

  const [status, setStatus] = useState<VerifyStatus>(() =>
    token ? "loading" : "error"
  )
  const [message, setMessage] = useState(() =>
    token
      ? "Estamos verificando tu correo. Espera un momento."
      : "El enlace de verificación no contiene un token válido."
  )

  useEffect(() => {
    if (!token || hasVerifiedRef.current) return

    hasVerifiedRef.current = true

    const confirmEmail = async () => {
      try {
        await verifyEmail(token)

        setStatus("success")
        setMessage(
          "Tu correo fue verificado correctamente. Ya puedes iniciar sesión."
        )
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "No se pudo verificar tu correo. Intenta solicitar un nuevo enlace."

        setStatus("error")
        setMessage(errorMessage)
      }
    }

    void confirmEmail()
  }, [token])

  const icon =
    status === "loading" ? (
      <Loader2 className="h-10 w-10 animate-spin text-[#3B82F6]" />
    ) : status === "success" ? (
      <CheckCircle2 className="h-10 w-10 text-[#22C55E]" />
    ) : (
      <XCircle className="h-10 w-10 text-[#EF4444]" />
    )

  return (
    <AuthLayout
      title="Confirmación de correo"
      description="Estamos procesando la verificación de tu cuenta."
    >
      <div className="flex flex-col items-center text-center gap-5">
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-3xl border ${
            status === "success"
              ? "border-[#22C55E]/30 bg-[#22C55E]/10"
              : status === "error"
                ? "border-[#EF4444]/30 bg-[#EF4444]/10"
                : "border-[#3B82F6]/30 bg-[#3B82F6]/10"
          }`}
        >
          {icon}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[#0F172A]">
            {status === "loading"
              ? "Verificando correo"
              : status === "success"
                ? "Correo verificado"
                : "No se pudo verificar"}
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
            {message}
          </p>
        </div>

        {status === "success" && (
          <Link
            href="/auth/login"
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#3B82F6] px-5 text-sm font-medium text-white shadow-lg shadow-[#3B82F6]/20 transition hover:bg-[#3B82F6]/90"
          >
            Ir al inicio de sesión
          </Link>
        )}

        {status === "error" && (
          <div className="flex w-full flex-col gap-3">
            <Link
              href="/auth/resend-verification"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#3B82F6] px-5 text-sm font-medium text-white shadow-lg shadow-[#3B82F6]/20 transition hover:bg-[#3B82F6]/90"
            >
              <MailWarning className="h-4 w-4" />
              Solicitar nuevo correo
            </Link>

            <Link
              href="/auth/login"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-[#E2E8F0] px-5 text-sm font-medium text-[#64748B] transition hover:bg-[#F8FAFC] hover:text-[#0F172A]"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}