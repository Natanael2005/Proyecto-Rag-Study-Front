"use client"

import React, { useRef, useState } from "react"
import Link from "next/link"
import { CheckCircle2, Loader2, Mail, Send } from "lucide-react"
import { AuthLayout } from "@/components/auth-layout"
import { forgotPassword } from "@/lib/auth-api"

export function ForgotPasswordClient() {
  const isSubmittingRef = useRef(false)

  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isFormValid = email.trim() !== ""

  const handleForgotPassword = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (isSubmittingRef.current || isLoading) return

    if (!isFormValid) {
      setError("Ingresa tu correo institucional.")
      return
    }

    isSubmittingRef.current = true

    try {
      setIsLoading(true)
      setError(null)
      setSuccessMessage(null)

      await forgotPassword({
        email: email.trim(),
      })

      setSuccessMessage(
        "Si el correo existe, te enviamos las instrucciones para restablecer tu contrasena."
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo solicitar la recuperacion de contrasena."

      setError(message)
    } finally {
      setIsLoading(false)
      isSubmittingRef.current = false
    }
  }

  return (
    <AuthLayout
      title="Recuperar contrasena"
      description="Ingresa tu correo electronico y te enviaremos un enlace para restablecer tu contrasena."
    >
      <form
        onSubmit={handleForgotPassword}
        className="flex w-full flex-col gap-5"
      >
        {successMessage && (
          <div className="flex gap-3 rounded-lg border border-[#22C55E]/30 bg-[#22C55E]/10 px-4 py-3 text-sm text-[#15803D]">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-3 text-sm text-[#EF4444]">
            {error}
          </div>
        )}

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
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="matricula@utcancun.edu.mx"
              disabled={isLoading}
              className="h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#E2E8F0]/30 pl-9 text-[#0F172A] outline-none transition-all placeholder:text-[#64748B]/60 focus:ring-2 focus:ring-[#3B82F6]/20 disabled:opacity-60"
            />
          </div>
        </div>

        <div className="mt-2">
          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl font-medium transition-all ${
              isFormValid && !isLoading
                ? "bg-[#3B82F6] text-[#FFFFFF] shadow-lg shadow-[#3B82F6]/20 hover:bg-[#3B82F6]/90 active:scale-[0.98]"
                : "cursor-not-allowed bg-[#E2E8F0] text-[#94A3B8]"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando enlace...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Enviar enlace de recuperacion
              </>
            )}
          </button>

          <p className="mt-4 text-center text-sm text-[#64748B]">
            Recordaste tu contrasena?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-[#3B82F6] transition-colors hover:text-[#3B82F6]/80"
            >
              Inicia sesion
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}
