"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  BookOpen,
  Copy,
  Loader2,
  Plus,
  RefreshCw,
  School,
  UsersRound,
  X,
} from "lucide-react"
import { getCurrentUser, type AuthUser } from "@/lib/auth-api"
import {
  createOrganization,
  getMyOrganizations,
  joinOrganization,
  type CreateOrganizationPayload,
  type Organization,
} from "@/lib/organizations-api"

type ApiRecord = Record<string, unknown>
type ActiveOrganizationForm = "create" | "join" | null

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null
}

function getString(value: unknown) {
  return typeof value === "string" ? value : ""
}

function getNumber(value: unknown) {
  return typeof value === "number" ? value : undefined
}

function pickArray(data: unknown, keys: string[]) {
  if (Array.isArray(data)) {
    return data
  }

  if (!isRecord(data)) {
    return []
  }

  return keys.map((key) => data[key]).find(Array.isArray) ?? []
}

function normalizeOrganization(item: unknown, index: number): Organization {
  if (!isRecord(item)) {
    return {
      id: String(index),
      name: `Salon ${index + 1}`,
    }
  }

  return {
    id: getString(item.id) || getString(item.organization_id) || String(index),
    name: getString(item.name) || `Salon ${index + 1}`,
    description: getString(item.description),
    subject: getString(item.subject),
    career_id: getNumber(item.career_id),
    created_by: getString(item.created_by),
    join_code: getString(item.join_code),
    created_at: getString(item.created_at),
  }
}

function normalizeOrganizations(data: unknown) {
  return pickArray(data, [
    "organizations",
    "organizaciones",
    "salones",
    "data",
    "items",
    "results",
  ]).map(normalizeOrganization)
}

function getRoleLabel(role?: string) {
  if (role === "teacher") return "Profesor"
  if (role === "student") return "Alumno"

  return role ?? "Cuenta"
}

const emptyCreateForm: CreateOrganizationPayload = {
  name: "",
  description: "",
  subject: "",
}

export function OrganizationsDashboard() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [createForm, setCreateForm] = useState(emptyCreateForm)
  const [joinCode, setJoinCode] = useState("")
  const [activeForm, setActiveForm] = useState<ActiveOrganizationForm>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const isTeacher = user?.role === "teacher"
  const isStudent = user?.role === "student"
  const canCreate = Boolean(
    createForm.name.trim() &&
      createForm.description.trim() &&
      createForm.subject.trim()
  )

  const sortedOrganizations = useMemo(
    () =>
      [...organizations].sort((current, next) =>
        current.name.localeCompare(next.name)
      ),
    [organizations]
  )

  const loadOrganizationsData = async () => {
    const [currentUser, organizationsData] = await Promise.all([
      getCurrentUser(),
      getMyOrganizations(),
    ])

    return {
      currentUser,
      organizations: normalizeOrganizations(organizationsData),
    }
  }

  const loadOrganizations = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const data = await loadOrganizationsData()

      setUser(data.currentUser)
      setOrganizations(data.organizations)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los salones."

      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const loadInitialOrganizations = async () => {
      try {
        const data = await loadOrganizationsData()

        if (!isMounted) return

        setUser(data.currentUser)
        setOrganizations(data.organizations)
      } catch (error) {
        if (!isMounted) return

        const message =
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los salones."

        setError(message)
      } finally {
        if (!isMounted) return

        setIsLoading(false)
      }
    }

    void loadInitialOrganizations()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!activeForm) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveForm(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [activeForm])

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!canCreate) return

    try {
      setIsSubmitting(true)
      setError(null)
      setSuccessMessage(null)

      const createdOrganization = (await createOrganization({
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        subject: createForm.subject.trim(),
      })) as unknown

      const organization = normalizeOrganization(
        createdOrganization,
        organizations.length
      )

      setCreateForm(emptyCreateForm)
      setActiveForm(null)
      setSuccessMessage(
        organization.join_code
          ? `Salon creado. Codigo: ${organization.join_code}`
          : "Salon creado correctamente."
      )
      await loadOrganizations()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo crear el salon."

      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleJoin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const code = joinCode.trim()

    if (!code) return

    try {
      setIsSubmitting(true)
      setError(null)
      setSuccessMessage(null)

      await joinOrganization(code)
      setJoinCode("")
      setActiveForm(null)
      setSuccessMessage("Solicitud enviada. Espera la aprobacion del profesor.")
      await loadOrganizations()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo enviar la solicitud."

      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Organizaciones
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Salones</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Crea grupos de estudio, administra alumnos y prepara el espacio para
            decks, cards y quizzes compartidos por salon.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => void loadOrganizations()}
            disabled={isLoading || isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </button>

          {isTeacher && (
            <button
              type="button"
              onClick={() =>
                setActiveForm((current) =>
                  current === "create" ? null : "create"
                )
              }
              disabled={isSubmitting}
              aria-expanded={activeForm === "create"}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                activeForm === "create"
                  ? "bg-blue-700 text-white shadow-lg shadow-blue-600/20"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <Plus className="h-4 w-4" />
              Crear organizacion
            </button>
          )}

          {isStudent && (
            <button
              type="button"
              onClick={() =>
                setActiveForm((current) => (current === "join" ? null : "join"))
              }
              disabled={isSubmitting}
              aria-expanded={activeForm === "join"}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                activeForm === "join"
                  ? "bg-blue-700 text-white shadow-lg shadow-blue-600/20"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <Copy className="h-4 w-4" />
              Unirse a organizacion
            </button>
          )}
        </div>
      </div>

      {user && (
        <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Entraste como {getRoleLabel(user.role)}. Las acciones disponibles se
          ajustan a tu rol.
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {activeForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Cerrar formulario"
            onClick={() => setActiveForm(null)}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
          />

          {isTeacher && activeForm === "create" && (
          <form
            onSubmit={handleCreate}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-organization-title"
            className="relative z-10 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/20"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h2
                    id="create-organization-title"
                    className="font-semibold text-slate-950"
                  >
                    Crear organizacion
                  </h2>
                  <p className="text-sm text-slate-500">
                    El codigo de union se genera automaticamente.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveForm(null)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                aria-label="Cerrar formulario"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3">
              <input
                value={createForm.name}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Nombre de la organizacion"
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20"
              />
              <input
                value={createForm.subject}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    subject: event.target.value,
                  }))
                }
                placeholder="Asignatura"
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20"
              />
              <textarea
                value={createForm.description}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Descripcion"
                rows={3}
                className="resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <button
              type="submit"
              disabled={!canCreate || isSubmitting}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <School className="h-4 w-4" />
              )}
              Crear organizacion
            </button>
          </form>
          )}

          {isStudent && activeForm === "join" && (
          <form
            onSubmit={handleJoin}
            role="dialog"
            aria-modal="true"
            aria-labelledby="join-organization-title"
            className="relative z-10 w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/20"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Copy className="h-5 w-5" />
                </div>
                <div>
                  <h2
                    id="join-organization-title"
                    className="font-semibold text-slate-950"
                  >
                    Unirse a organizacion
                  </h2>
                  <p className="text-sm text-slate-500">
                    Tu solicitud queda en espera hasta que el profesor la acepte.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveForm(null)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                aria-label="Cerrar formulario"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value)}
                placeholder="Ej. CLASS-XYZ1"
                className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm uppercase text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20"
              />
              <button
                type="submit"
                disabled={!joinCode.trim() || isSubmitting}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Unirme
              </button>
            </div>
          </form>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-56 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Cargando salones...
        </div>
      ) : sortedOrganizations.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sortedOrganizations.map((organization) => (
            <Link
              key={organization.id}
              href={`/dashboard/organizaciones/${organization.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <BookOpen className="h-5 w-5" />
                </div>
                {organization.join_code && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {organization.join_code}
                  </span>
                )}
              </div>

              <h2 className="truncate font-semibold text-slate-950">
                {organization.name}
              </h2>
              <p className="mt-1 truncate text-sm text-blue-600">
                {organization.subject || "Sin asignatura"}
              </p>
              <p className="mt-3 line-clamp-2 text-sm text-slate-500">
                {organization.description || "Sin descripcion."}
              </p>

              <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                <UsersRound className="h-4 w-4" />
                Ver salon
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <School className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-slate-950">
            Aun no hay salones
          </h2>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            {isTeacher
              ? "Crea tu primer salon para invitar alumnos y preparar decks compartidos."
              : "Unete a un salon con el codigo que te comparta tu profesor."}
          </p>
        </div>
      )}
    </section>
  )
}
