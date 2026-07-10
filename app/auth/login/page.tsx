"use client"

import React, { useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react"
import { AuthLayout } from "@/components/auth-layout"
import { ApiRequestError, loginUser } from "@/lib/auth-api"

function getPostLoginRedirectPath() {
  const fallbackPath = "/dashboard"

  if (typeof window === "undefined") {
    return fallbackPath
  }

  const nextPath = new URLSearchParams(window.location.search).get("next")

  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return fallbackPath
  }

  return nextPath
}

export default function LoginPage() {
  const router = useRouter()
  const isSubmittingRef = useRef(false)

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isFormValid = email.trim() !== "" && password.trim() !== ""

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmittingRef.current || isLoading) return

    if (!isFormValid) {
      setError("Ingresa tu correo y contraseña.")
      return
    }

    isSubmittingRef.current = true

    try {
      setIsLoading(true)
      setError(null)

      await loginUser({
        email: email.trim(),
        password,
      })

      router.replace(getPostLoginRedirectPath())
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 403) {
        router.push(
          `/auth/resend-verification?email=${encodeURIComponent(email.trim())}`
        )
        return
      }

      const message =
        error instanceof Error
          ? error.message
          : "No se pudo iniciar sesión. Inténtalo de nuevo."

      setError(message)
    } finally {
      setIsLoading(false)
      isSubmittingRef.current = false
    }
  }

  return (
    <AuthLayout
      title="Bienvenido de vuelta"
      description="Ingresa tus credenciales para acceder a tu cuenta."
      view="login"
    >
      <form onSubmit={handleLogin} className="flex flex-col gap-5 w-full">
        {error && (
          <div className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-3 text-sm text-[#EF4444]">
            {error}
          </div>
        )}

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
              autoComplete="username"
              placeholder="tu.matricula@utcancun.edu.mx"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isLoading}
              className="w-full h-10 pl-9 bg-[#E2E8F0]/30 border border-[#E2E8F0] text-[#0F172A] rounded-xl focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all disabled:opacity-60"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 relative">
          <div className="flex justify-between items-end">
            <label
              htmlFor="password"
              className="text-[#0F172A] text-[10px] font-semibold uppercase tracking-wider"
            >
              Contraseña
            </label>

            <Link
              href="/auth/forgot-password"
              className="text-[10px] text-[#3B82F6] hover:text-[#3B82F6]/80 transition-colors font-medium uppercase tracking-wider"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <div className="relative flex items-center">
            <Lock className="absolute left-3 h-4 w-4 text-[#64748B] pointer-events-none" />

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isLoading}
              className="w-full h-10 pl-9 pr-10 bg-[#E2E8F0]/30 border border-[#E2E8F0] text-[#0F172A] rounded-xl focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all disabled:opacity-60"
            />

            <button
              type="button"
              disabled={isLoading}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-[#64748B] hover:text-[#0F172A] transition-colors disabled:opacity-60"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-2">
          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className={`flex items-center justify-center w-full h-11 rounded-xl font-medium transition-all ${
              isFormValid && !isLoading
                ? "bg-[#3B82F6] text-[#FFFFFF] hover:bg-[#3B82F6]/90 shadow-lg shadow-[#3B82F6]/20 cursor-pointer"
                : "bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300" />
          </div>

          <div className="relative flex justify-center text-sm font-medium leading-6">
            <span className="bg-white px-6 text-gray-900">
              O continúa con
            </span>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
              <path
                d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                fill="#EA4335"
              />
              <path
                d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                fill="#4285F4"
              />
              <path
                d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                fill="#FBBC05"
              />
              <path
                d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26537 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                fill="#34A853"
              />
            </svg>

            Iniciar sesión con Google
          </button>
        </div>
      </div>
    </AuthLayout>
  )
}
