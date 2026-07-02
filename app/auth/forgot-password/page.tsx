"use client"

import React from "react"
import Link from "next/link"
import { AuthLayout } from "@/components/auth-layout"
import { Mail } from "lucide-react" 

export default function ForgotPasswordPage() {
  // Vista principal (Formulario Estático)
  return (
    <AuthLayout
      title="Recuperar contraseña"
      description="Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña."
    >
      <form 
        onSubmit={(e) => e.preventDefault()} 
        className="flex flex-col gap-5 w-full"
      >
        <div className="flex flex-col gap-1.5 relative">
          <label htmlFor="email" className="text-[#0F172A] text-[10px] font-semibold uppercase tracking-wider">
            Correo electrónico
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3 h-4 w-4 text-[#64748B]" />
            <input
              id="email"
              type="email"
              placeholder="matricula@utcancun.edu.mx"
              className="w-full h-10 pl-9 bg-[#E2E8F0]/30 border border-[#E2E8F0] text-[#0F172A] rounded-xl focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all placeholder:text-[#64748B]/60"
            />
          </div>
        </div>

        <div className="mt-2">
          <button
            type="submit"
            className="flex items-center justify-center w-full h-11 bg-[#3B82F6] text-[#FFFFFF] hover:bg-[#3B82F6]/90 rounded-xl font-medium shadow-lg shadow-[#3B82F6]/20 transition-all active:scale-[0.98]"
          >
            Enviar enlace de recuperación
          </button>

          <p className="text-center text-sm text-[#64748B] mt-4">
            ¿Recordaste tu contraseña?{" "}
            <Link href="/auth/login" className="text-[#3B82F6] hover:text-[#3B82F6]/80 font-semibold transition-colors">
              Inicia sesión
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}