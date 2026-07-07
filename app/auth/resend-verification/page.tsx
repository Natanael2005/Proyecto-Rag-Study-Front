"use client"

import React, { useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Loader2, Mail, Send } from "lucide-react"
import { AuthLayout } from "@/components/auth-layout"
import { resendVerificationEmail } from "@/lib/auth-api"

export default function ResendVerificationPage() {
  const searchParams = useSearchParams()
  const emailFromQuery = searchParams.get("email") ?? ""

  const isSubmittingRef = useRef(false)

  const [email, setEmail] = useState(emailFromQuery)
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
        "Te enviamos un nuevo correo de verificación. Revisa tu bandeja de entrada o spam."
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo reenviar el correo de verificación."

      setError(message)
    } finally {
      setIsLoading(false)
      isSubmittingRef.current = false
    }
  }

  return (
    <AuthLayout
      title="Verifica tu correo"
      description="Tu cuenta existe, pero necesitas confirmar tu correo antes de iniciar sesión."
    >
      <form
        onSubmit={handleResendVerification}
        className="flex flex-col gap-5 w-full"
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
            No puedes iniciar sesión hasta verificar tu cuenta. Ingresa tu correo
            institucional para recibir un nuevo enlace de confirmación.
          </p>
        </div>

        <div className="flex flex-col gap-1.5 relative">
          <label
            htmlFor="email"
            className="text-[#0F172A] text-[10px] font-semibold uppercase tracking-wider"
          >
            Correo electrónico
          </label>

          <div className="relative flex items-center">
            <Mail className="absolute left-3 h-4 w-4 text-[#64748B] pointer-events-none" />

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu.correo@utcancun.edu.mx"
              disabled={isLoading}
              className="w-full h-10 pl-9 bg-[#E2E8F0]/30 border border-[#E2E8F0] text-[#0F172A] rounded-xl focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all disabled:opacity-60"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          className={`flex items-center justify-center gap-2 w-full h-11 rounded-xl font-medium transition-all ${
            isFormValid && !isLoading
              ? "bg-[#3B82F6] text-[#FFFFFF] hover:bg-[#3B82F6]/90 shadow-lg shadow-[#3B82F6]/20 cursor-pointer"
              : "bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed"
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
              Reenviar correo de verificación
            </>
          )}
        </button>

        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center gap-2 text-sm font-medium text-[#64748B] hover:text-[#3B82F6] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio de sesión
        </Link>
      </form>
    </AuthLayout>
  )
}