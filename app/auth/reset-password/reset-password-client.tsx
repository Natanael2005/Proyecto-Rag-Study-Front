"use client"

import React, { useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Check, CheckCircle2, Eye, EyeOff, Loader2, Lock, X } from "lucide-react"
import { AuthLayout } from "@/components/auth-layout"
import { resetPassword } from "@/lib/auth-api"

type ResetPasswordClientProps = {
  token: string
}

export function ResetPasswordClient({ token }: ResetPasswordClientProps) {
  const isSubmittingRef = useRef(false)

  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(
    token ? null : "El enlace de recuperacion no contiene un token valido."
  )

  const checks = useMemo(
    () => ({
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }),
    [password]
  )

  const passed = Object.values(checks).filter(Boolean).length
  const passwordsMatch = password !== "" && password === confirmPassword
  const isFormValid = token !== "" && passed === 4 && passwordsMatch

  const handleResetPassword = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (isSubmittingRef.current || isLoading) return

    if (!token) {
      setError("El enlace de recuperacion no contiene un token valido.")
      return
    }

    if (passed !== 4) {
      setError("La nueva contrasena no cumple los requisitos.")
      return
    }

    if (!passwordsMatch) {
      setError("Las contrasenas no coinciden.")
      return
    }

    isSubmittingRef.current = true

    try {
      setIsLoading(true)
      setError(null)
      setSuccessMessage(null)

      await resetPassword({
        token,
        new_password: password,
      })

      setSuccessMessage(
        "Contrasena actualizada exitosamente. Ya puedes iniciar sesion."
      )
      setPassword("")
      setConfirmPassword("")
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la contrasena."

      setError(message)
    } finally {
      setIsLoading(false)
      isSubmittingRef.current = false
    }
  }

  return (
    <AuthLayout
      title="Restablecer contrasena"
      description="Crea una nueva contrasena para recuperar el acceso a tu cuenta."
    >
      <form
        onSubmit={handleResetPassword}
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
            htmlFor="new_password"
            className="text-[10px] font-semibold uppercase tracking-wider text-[#0F172A]"
          >
            Nueva contrasena
          </label>

          <div className="relative flex items-center">
            <Lock className="pointer-events-none absolute left-3 h-4 w-4 text-[#64748B]" />

            <input
              id="new_password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Minimo 12 caracteres"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isLoading || successMessage !== null || token === ""}
              className="h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#E2E8F0]/30 pl-9 pr-10 text-[#0F172A] outline-none transition-all focus:ring-2 focus:ring-[#3B82F6]/20 disabled:opacity-60"
            />

            <button
              type="button"
              disabled={isLoading || successMessage !== null}
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-2 z-10 cursor-pointer p-1 text-[#64748B] transition-colors hover:text-[#0F172A] disabled:opacity-60"
              aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="mt-2 flex flex-col gap-2">
            <div className="flex h-1.5 gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all duration-300 ${
                    i <= passed
                      ? passed === 4
                        ? "bg-[#22C55E]"
                        : passed >= 3
                          ? "bg-[#EAB308]"
                          : "bg-[#EF4444]"
                      : "bg-[#F1F5F9]"
                  }`}
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px]">
              {[
                { key: "length", label: "Min. 12 caracteres" },
                { key: "uppercase", label: "Una mayuscula" },
                { key: "number", label: "Un numero" },
                { key: "special", label: "Un caracter especial" },
              ].map((rule) => (
                <span
                  key={rule.key}
                  className={`flex items-center gap-1 transition-colors ${
                    checks[rule.key as keyof typeof checks]
                      ? "font-medium text-[#3B82F6]"
                      : "text-[#64748B]"
                  }`}
                >
                  {checks[rule.key as keyof typeof checks] ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}

                  {rule.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative flex flex-col gap-1.5">
          <label
            htmlFor="confirm_password"
            className="text-[10px] font-semibold uppercase tracking-wider text-[#0F172A]"
          >
            Confirmar contrasena
          </label>

          <div className="relative flex items-center">
            <Lock className="pointer-events-none absolute left-3 h-4 w-4 text-[#64748B]" />

            <input
              id="confirm_password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repite la nueva contrasena"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={isLoading || successMessage !== null || token === ""}
              className="h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#E2E8F0]/30 pl-9 text-[#0F172A] outline-none transition-all focus:ring-2 focus:ring-[#3B82F6]/20 disabled:opacity-60"
            />
          </div>

          {confirmPassword !== "" && !passwordsMatch && (
            <p className="text-xs text-[#EF4444]">
              Las contrasenas no coinciden.
            </p>
          )}
        </div>

        {successMessage ? (
          <Link
            href="/auth/login"
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#3B82F6] px-5 text-sm font-medium text-white shadow-lg shadow-[#3B82F6]/20 transition hover:bg-[#3B82F6]/90"
          >
            Ir al inicio de sesion
          </Link>
        ) : (
          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl font-medium transition-all ${
              isFormValid && !isLoading
                ? "bg-[#3B82F6] text-[#FFFFFF] shadow-lg shadow-[#3B82F6]/20 hover:bg-[#3B82F6]/90"
                : "cursor-not-allowed bg-[#E2E8F0] text-[#94A3B8]"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Actualizando...
              </>
            ) : (
              "Restablecer contrasena"
            )}
          </button>
        )}
      </form>
    </AuthLayout>
  )
}
