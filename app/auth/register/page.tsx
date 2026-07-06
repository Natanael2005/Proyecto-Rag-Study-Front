"use client"

import React, { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthLayout } from "@/components/auth-layout"
import { registerStudent, registerTeacher } from "@/lib/auth-api"
import {
  Eye,
  EyeOff,
  Loader2,
  Check,
  X,
  User,
  Mail,
  Hash,
  BookOpen,
  Lock,
  ArrowRight,
  ArrowLeft,
} from "lucide-react"

const MOCK_CAREERS = [
  { id: 1, name: "Licenciatura en Negocios y Mercadotecnia" },
  { id: 2, name: "Licenciatura en Contaduría" },
  { id: 3, name: "Licenciatura en Administración" },
  { id: 4, name: "Licenciatura en Gestión del Bienestar" },
  { id: 5, name: "Licenciatura en Gestión y Desarrollo Turístico" },
  {
    id: 6,
    name: "Licenciatura en Ingeniería en Mantenimiento Industrial, Área Instalaciones",
  },
  {
    id: 7,
    name: "Licenciatura en Ingeniería en Tecnología de la Información e Innovación Digital, Área Desarrollo de Software Multiplataforma",
  },
  {
    id: 8,
    name: "Licenciatura en Ingeniería en Tecnología de la Información e Innovación Digital, Área Infraestructura de Redes Digitales",
  },
  { id: 9, name: "Licenciatura en Gastronomía" },
]

export default function RegisterPage() {
  const router = useRouter()
  const isSubmittingRef = useRef(false)

  const [step, setStep] = useState(1)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [role, setRole] = useState<"alumno" | "profesor">("alumno")
  const [email, setEmail] = useState("")
  const [matricula, setMatricula] = useState("")
  const [careerId, setCareerId] = useState("")

  const [showPassword, setShowPassword] = useState(false)
  const [passwordValue, setPasswordValue] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checks = {
    length: passwordValue.length >= 12,
    uppercase: /[A-Z]/.test(passwordValue),
    number: /[0-9]/.test(passwordValue),
    special: /[^A-Za-z0-9]/.test(passwordValue),
  }

  const passed = Object.values(checks).filter(Boolean).length

  const isCurrentStepValid = () => {
    if (step === 1) {
      return firstName.trim() !== "" && lastName.trim() !== ""
    }

    if (step === 2) {
      if (role === "alumno") {
        return (
          email.trim() !== "" &&
          matricula.trim() !== "" &&
          careerId !== ""
        )
      }

      return email.trim() !== "" && careerId !== ""
    }

    if (step === 3) {
      return passed === 4
    }

    return false
  }

  const nextStep = () => {
    if (isCurrentStepValid()) {
      setStep((current) => (current < 3 ? current + 1 : current))
    }
  }

  const prevStep = () => {
    setStep((current) => (current > 1 ? current - 1 : current))
  }

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // console.count("handleRegister ejecutado")

    if (isSubmittingRef.current || isLoading) {
      console.warn("Registro bloqueado: ya hay una petición en proceso.")
      return
    }

    if (!isCurrentStepValid()) return

    const career_id = Number(careerId)

    if (!career_id) {
      setError("Selecciona una carrera válida.")
      return
    }

    isSubmittingRef.current = true

    try {
      setIsLoading(true)
      setError(null)

      if (role === "alumno") {
        const studentPayload = {
          career_id,
          email: email.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          matricula: matricula.trim(),
          password: passwordValue,
        }

        // console.log("Payload alumno:", {
        //   ...studentPayload,
        //   password: "********",
        // })

        await registerStudent(studentPayload)
      } else {
        const teacherPayload = {
          career_id,
          email: email.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          password: passwordValue,
        }

        // console.log("Payload profesor:", {
        //   ...teacherPayload,
        //   password: "********",
        // })

        await registerTeacher(teacherPayload)
      }

      router.push("/auth/login")
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo crear la cuenta. Inténtalo de nuevo."

      setError(message)
    } finally {
      setIsLoading(false)
      isSubmittingRef.current = false
    }
  }

  return (
    <AuthLayout
      title="Crear cuenta"
      description="Únete a tu salón, sube apuntes y estudia con cards generadas a partir de tu material."
      view="register"
    >
      <form onSubmit={handleRegister} className="flex flex-col gap-4 w-full">
        {error && (
          <div className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-3 text-sm text-[#EF4444]">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2 mb-2">
          <span className="text-[#0F172A] text-[10px] font-bold uppercase tracking-wider">
            Paso {step} de 3
          </span>

          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  step >= i ? "bg-[#3B82F6]" : "bg-[#E2E8F0]"
                }`}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5 relative">
                <label
                  htmlFor="first_name"
                  className="text-[#0F172A] text-[10px] font-semibold uppercase tracking-wider"
                >
                  Nombre
                </label>

                <div className="relative flex items-center">
                  <User className="absolute left-3 h-4 w-4 text-[#64748B] pointer-events-none" />

                  <input
                    id="first_name"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="Nombres"
                    disabled={isLoading}
                    className="w-full h-10 pl-9 bg-[#E2E8F0]/30 border border-[#E2E8F0] text-[#0F172A] rounded-xl focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label
                  htmlFor="last_name"
                  className="text-[#0F172A] text-[10px] font-semibold uppercase tracking-wider"
                >
                  Apellidos
                </label>

                <div className="relative flex items-center">
                  <User className="absolute left-3 h-4 w-4 text-[#64748B] pointer-events-none" />

                  <input
                    id="last_name"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder="Apellidos"
                    disabled={isLoading}
                    className="w-full h-10 pl-9 bg-[#E2E8F0]/30 border border-[#E2E8F0] text-[#0F172A] rounded-xl focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-[#0F172A] text-[10px] font-semibold uppercase tracking-wider">
                Soy
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setRole("alumno")}
                  className={`relative cursor-pointer text-left rounded-xl border p-3 transition-all duration-200 disabled:opacity-60 ${
                    role === "alumno"
                      ? "border-[#3B82F6] bg-[#3B82F6]/5 ring-1 ring-[#3B82F6]/50"
                      : "border-[#E2E8F0] bg-[#E2E8F0]/30 hover:bg-[#E2E8F0]/50"
                  }`}
                >
                  <h3 className="font-semibold text-[#0F172A] text-sm">
                    Alumno/a
                  </h3>

                  <p className="text-[11px] text-[#64748B] mt-1 leading-tight">
                    Me uno a clases y estudio
                  </p>

                  {role === "alumno" && (
                    <div className="absolute top-3 right-3 text-[#3B82F6]">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    setRole("profesor")
                    setMatricula("")
                  }}
                  className={`relative cursor-pointer text-left rounded-xl border p-3 transition-all duration-200 disabled:opacity-60 ${
                    role === "profesor"
                      ? "border-[#3B82F6] bg-[#3B82F6]/5 ring-1 ring-[#3B82F6]/50"
                      : "border-[#E2E8F0] bg-[#E2E8F0]/30 hover:bg-[#E2E8F0]/50"
                  }`}
                >
                  <h3 className="font-semibold text-[#0F172A] text-sm">
                    Profesor/a
                  </h3>

                  <p className="text-[11px] text-[#64748B] mt-1 leading-tight">
                    Creo clases y material
                  </p>

                  {role === "profesor" && (
                    <div className="absolute top-3 right-3 text-[#3B82F6]">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 relative">
              <label
                htmlFor="email"
                className="text-[#0F172A] text-[10px] font-semibold uppercase tracking-wider"
              >
                Correo institucional
              </label>

              <div className="relative flex items-center">
                <Mail className="absolute left-3 h-4 w-4 text-[#64748B] pointer-events-none" />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="matricula@utcancun.edu.mx"
                  disabled={isLoading}
                  className="w-full h-10 pl-9 bg-[#E2E8F0]/30 border border-[#E2E8F0] text-[#0F172A] rounded-xl focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {role === "alumno" && (
              <div className="flex flex-col gap-1.5 relative">
                <label
                  htmlFor="matricula"
                  className="text-[#0F172A] text-[10px] font-semibold uppercase tracking-wider"
                >
                  Matrícula
                </label>

                <div className="relative flex items-center">
                  <Hash className="absolute left-3 h-4 w-4 text-[#64748B] pointer-events-none" />

                  <input
                    id="matricula"
                    value={matricula}
                    onChange={(event) => setMatricula(event.target.value)}
                    placeholder="ej. 23393190"
                    disabled={isLoading}
                    className="w-full h-10 pl-9 bg-[#E2E8F0]/30 border border-[#E2E8F0] text-[#0F172A] rounded-xl focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all disabled:opacity-60"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[#0F172A] text-[10px] font-semibold uppercase tracking-wider">
                Carrera
              </label>

              <div className="relative flex items-center">
                <BookOpen className="absolute left-3 h-4 w-4 text-[#64748B] pointer-events-none" />

                <select
                  value={careerId}
                  onChange={(event) => setCareerId(event.target.value)}
                  disabled={isLoading}
                  className="w-full h-10 pl-9 pr-4 bg-[#E2E8F0]/30 border border-[#E2E8F0] text-[#0F172A] rounded-xl appearance-none focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all disabled:opacity-60"
                >
                  <option value="" disabled hidden>
                    Selecciona tu carrera
                  </option>

                  {MOCK_CAREERS.map((career) => (
                    <option key={career.id} value={career.id}>
                      {career.name}
                    </option>
                  ))}
                </select>

                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg
                    className="h-4 w-4 text-[#64748B]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 relative">
              <label
                htmlFor="reg_password"
                className="text-[#0F172A] text-[10px] font-semibold uppercase tracking-wider"
              >
                Contraseña
              </label>

              <div className="relative flex items-center">
                <Lock className="absolute left-3 h-4 w-4 text-[#64748B] pointer-events-none" />

                <input
                  id="reg_password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 12 caracteres"
                  value={passwordValue}
                  onChange={(event) => setPasswordValue(event.target.value)}
                  disabled={isLoading}
                  className="w-full h-10 pl-9 pr-10 bg-[#E2E8F0]/30 border border-[#E2E8F0] text-[#0F172A] rounded-xl focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all disabled:opacity-60"
                />

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 z-10 p-1 text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer disabled:opacity-60"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="mt-2 flex flex-col gap-2 transition-opacity">
                <div className="flex gap-1 h-1.5">
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
                    { key: "length", label: "Mín. 12 caracteres" },
                    { key: "uppercase", label: "Una mayúscula" },
                    { key: "number", label: "Un número" },
                    { key: "special", label: "Un carácter especial" },
                  ].map((rule) => (
                    <span
                      key={rule.key}
                      className={`flex items-center gap-1 transition-colors ${
                        checks[rule.key as keyof typeof checks]
                          ? "text-[#3B82F6] font-medium"
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
          </div>
        )}

        <div className="flex gap-3 mt-4">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              disabled={isLoading}
              className="flex items-center justify-center h-11 px-4 border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] rounded-xl font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!isCurrentStepValid() || isLoading}
              className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-xl font-medium transition-all ${
                isCurrentStepValid() && !isLoading
                  ? "bg-[#3B82F6] text-[#FFFFFF] shadow-lg shadow-[#3B82F6]/20 hover:bg-[#3B82F6]/90 cursor-pointer"
                  : "bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed"
              }`}
            >
              Continuar <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading || !isCurrentStepValid()}
              className={`flex-1 flex items-center justify-center h-11 rounded-xl font-medium transition-all ${
                isCurrentStepValid() && !isLoading
                  ? "bg-[#3B82F6] text-[#FFFFFF] shadow-lg shadow-[#3B82F6]/20 hover:bg-[#3B82F6]/90 cursor-pointer"
                  : "bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}

              {isLoading ? "Registrando..." : "Crear cuenta"}
            </button>
          )}
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300" />
          </div>

          <div className="relative flex justify-center text-sm font-medium leading-6">
            <span className="bg-white px-6 text-[#64748B]">
              O continúa con
            </span>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-[#0F172A] shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
                d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26537 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001Z"
                fill="#34A853"
              />
            </svg>

            Registrarse con Google
          </button>
        </div>
      </div>
    </AuthLayout>
  )
}