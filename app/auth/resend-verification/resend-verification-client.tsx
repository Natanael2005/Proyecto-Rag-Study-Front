"use client"

import React, { useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, Mail, Send } from "lucide-react"
import { AuthLayout } from "@/components/auth-layout"
import { resendVerificationEmail } from "@/lib/auth-api"

type ResendVerificationClientProps = {
  initialEmail: string
}

export function ResendVerificationClient({
  initialEmail,
}: ResendVerificationClientProps) {
  const isSubmittingRef = useRef(false)

  const [email, setEmail] = useState(initialEmail)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isFormValid = email.trim() !== ""

  const handleResendVerification = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (isSubmittingRef.current || isLoading) return

    if (!isFormValid) {
      setError("Ingresa el correo de tu cuenta.")
      return
    }

    isSubmittingRef.current = true

    try {
      setIsLoading(true)
      setError(null)
      setSuccessMessage(null)

      await resendVerificationEmail({
        email: email.trim(),
      })

      setSuccessMessage(
        "Te enviamos un nuevo correo de verificacion. Revisa tu bandeja de entrada o spam."
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo reenviar el correo de verificacion."

      setError(message)
    } finally {
      setIsLoading(false)
      isSubmittingRef.current = false
    }
  }

  return (
    <AuthLayout
      title="Verifica tu correo"
      description="Tu cuenta existe, pero necesitas confirmar tu correo antes de iniciar sesion."
    >
      <form
        onSubmit={handleResendVerification}
        className="flex w-full flex-col gap-5"
      >
        {successMessage && (
          <div className="rounded-lg border border-[#22C55E]/30 bg-[#22C55E]/10 px-4 py-3 text-sm text-[#15803D]">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-3 text-sm text-[#EF4444]">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-[#3B82F6]/20 bg-[#3B82F6]/5 p-4">
          <p className="text-sm leading-relaxed text-[#64748B]">
            No puedes iniciar sesion hasta verificar tu cuenta. Ingresa tu
            correo institucional para recibir un nuevo enlace de confirmacion.
          </p>
        </div>

        <div className="relative flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-[10px] font-semibold uppercase tracking-wider text-[#0F172A]"
          >
            Correo electronico
          </label>

          <div className="relative flex items-center">
            <Mail className="pointer-events-none absolute left-3 h-4 w-4 text-[#64748B]" />

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu.correo@utcancun.edu.mx"
              disabled={isLoading}
              className="h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#E2E8F0]/30 pl-9 text-[#0F172A] outline-none transition-all focus:ring-2 focus:ring-[#3B82F6]/20 disabled:opacity-60"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl font-medium transition-all ${
            isFormValid && !isLoading
              ? "cursor-pointer bg-[#3B82F6] text-[#FFFFFF] shadow-lg shadow-[#3B82F6]/20 hover:bg-[#3B82F6]/90"
              : "cursor-not-allowed bg-[#E2E8F0] text-[#94A3B8]"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Reenviando correo...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Reenviar correo de verificacion
            </>
          )}
        </button>

        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center gap-2 text-sm font-medium text-[#64748B] transition-colors hover:text-[#3B82F6]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio de sesion
        </Link>
      </form>
    </AuthLayout>
  )
}
