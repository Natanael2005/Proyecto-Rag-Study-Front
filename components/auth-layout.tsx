"use client"

import React from "react"
import Link from "next/link"
import { ArrowLeft, Sparkles, Bot } from "lucide-react"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  description: string
  view?: "login" | "register"
}

export function AuthLayout({ children, title, description, view }: AuthLayoutProps) {
  return (
    // 1. FONDO PRINCIPAL CLARO: Ocupa toda la pantalla con #F8FAFC
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-[#F8FAFC]">
      
      {/* 2. TARJETA PRINCIPAL: Ahora es un div normal sin animaciones */}
      <div className="relative z-10 w-full max-w-5xl bg-[#FFFFFF] rounded-4xl shadow-xl overflow-hidden border border-[#E2E8F0] lg:grid lg:grid-cols-2">
        
        {/* LADO IZQUIERDO: Contenedor del Formulario (Login/Registro) */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-14 relative z-10">
          <div className="mx-auto w-full max-w-md">
            
            {/* BOTÓN DE REGRESO A NEXABOT */}
            <Link 
              href="/" 
              className="group flex items-center gap-2 text-sm font-medium text-[#64748B] hover:text-[#3B82F6] mb-8 transition-colors w-fit"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#3B82F6]/10">
                <Bot className="h-4 w-4 text-[#3B82F6]" />
              </div>
              Regresar a NexaBot
            </Link>

            {/* PÍLDORA DE NAVEGACIÓN */}
            {view && (
              <div className="flex p-1 mb-8 rounded-full bg-[#F1F5F9] border border-[#E2E8F0]">
                {view === "login" ? (
                  <>
                    <div className="flex-1 text-center py-2 text-sm font-medium rounded-full bg-[#FFFFFF] shadow-sm text-[#0F172A]">
                      Iniciar sesión
                    </div>
                    <Link href="/auth/register" className="flex-1 text-center py-2 text-sm font-medium rounded-full text-[#64748B] hover:text-[#0F172A] transition-colors">
                      Crear cuenta
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="flex-1 text-center py-2 text-sm font-medium rounded-full text-[#64748B] hover:text-[#0F172A] transition-colors">
                      Iniciar sesión
                    </Link>
                    <div className="flex-1 text-center py-2 text-sm font-medium rounded-full bg-[#FFFFFF] shadow-sm text-[#0F172A]">
                      Crear cuenta
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ENCABEZADOS DINÁMICOS */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">{title}</h1>
              <p className="mt-2 text-sm text-[#64748B]">{description}</p>
            </div>

            {/* INYECCIÓN DE FORMULARIOS (LOGIN O REGISTRO) */}
            {children}
          </div>
        </div>

        {/* LADO DERECHO: Panel Visual Estético */}
        <div className="hidden lg:flex relative items-center justify-center p-12 overflow-hidden bg-[#3B82F6]/5 border-l border-[#E2E8F0]">
          <div className="relative z-20 flex flex-col items-center text-center max-w-sm">
            
            {/* ÍCONO CON SOMBRA SUAVE */}
            <div className="mb-8 p-5 bg-[#FFFFFF] rounded-3xl border border-[#E2E8F0] shadow-sm">
              <Sparkles className="h-10 w-10 text-[#3B82F6]" />
            </div>

            <h2 className="text-3xl font-bold text-[#0F172A] mb-4 tracking-tight leading-tight">
              Diseña tu <br/> experiencia
            </h2>

            {/* CUADRO DE TEXTO CLARO */}
            <p className="text-[#64748B] text-sm leading-relaxed bg-[#FFFFFF] p-4 rounded-2xl border border-[#E2E8F0] shadow-sm">
              Un entorno creado para estudiantes de la UT Cancún enfocado en llevar tus proyectos al siguiente nivel.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}