"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Check,
  Copy,
  Loader2,
  Mail,
  QrCode,
  Save,
  School,
  Trash2,
  UserCheck,
  UserX,
  UsersRound,
} from "lucide-react"
import {
  deleteOrganization,
  getMyOrganizations,
  getOrganizationInvites,
  getOrganizationMembers,
  getOrganizationQr,
  getOrganizationWaitlist,
  inviteOrganizationMember,
  updateOrganization,
  updateOrganizationMemberStatus,
  type Organization,
  type OrganizationInvite,
  type OrganizationMember,
} from "@/lib/organizations-api"
import { getCurrentUser, type AuthUser } from "@/lib/auth-api"

type OrganizationDetailProps = {
  organizationId: string
}

type ApiRecord = Record<string, unknown>

type DetailTab = "flashcards" | "members" | "invites" | "settings"

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

function normalizeMember(item: unknown, index: number): OrganizationMember {
  if (!isRecord(item)) {
    return {
      organization_id: "",
      user_id: String(index),
    }
  }

  return {
    organization_id: getString(item.organization_id),
    user_id: getString(item.user_id) || getString(item.id) || String(index),
    role: getString(item.role),
    status: getString(item.status),
    joined_at: getString(item.joined_at),
    first_name: getString(item.first_name),
    last_name: getString(item.last_name),
    email: getString(item.email),
  }
}

function normalizeMembers(data: unknown) {
  return pickArray(data, ["members", "miembros", "data", "items", "results"]).map(
    normalizeMember
  )
}

function normalizeInvite(item: unknown, index: number): OrganizationInvite {
  if (!isRecord(item)) {
    return {
      id: String(index),
      organization_id: "",
      email: "",
    }
  }

  return {
    id: getString(item.id) || String(index),
    organization_id: getString(item.organization_id),
    email: getString(item.email),
    invited_by: getString(item.invited_by),
    status: getString(item.status),
    created_at: getString(item.created_at),
  }
}

function normalizeInvites(data: unknown) {
  return pickArray(data, ["invites", "invitations", "data", "items", "results"]).map(
    normalizeInvite
  )
}

function getQrValue(data: unknown) {
  if (typeof data === "string") {
    return data
  }

  if (!isRecord(data)) {
    return ""
  }

  return (
    getString(data.qr_image_url) ||
    getString(data.qr_url) ||
    getString(data.url) ||
    getString(data.image_url) ||
    getString(data.qr)
  )
}

function getMemberName(member: OrganizationMember) {
  const fullName = `${member.first_name ?? ""} ${member.last_name ?? ""}`.trim()

  return fullName || member.email || member.user_id
}

function getStatusLabel(status?: string) {
  if (status === "accepted") return "Aceptado"
  if (status === "pending") return "Pendiente"
  if (status === "rejected") return "Rechazado"

  return status || "Sin estatus"
}

const detailTabs: Array<{ id: DetailTab; label: string; teacherOnly?: boolean }> = [
  { id: "flashcards", label: "Flashcards" },
  { id: "members", label: "Miembros" },
  { id: "invites", label: "Invitaciones", teacherOnly: true },
  { id: "settings", label: "Ajustes", teacherOnly: true },
]

export function OrganizationDetail({ organizationId }: OrganizationDetailProps) {
  const router = useRouter()

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [waitlist, setWaitlist] = useState<OrganizationMember[]>([])
  const [invites, setInvites] = useState<OrganizationInvite[]>([])
  const [qrValue, setQrValue] = useState("")
  const [activeTab, setActiveTab] = useState<DetailTab>("flashcards")
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    subject: "",
  })
  const [inviteEmail, setInviteEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [mutatingStudentId, setMutatingStudentId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const acceptedMembers = useMemo(
    () =>
      members.filter(
        (member) => member.status !== "pending" && member.status !== "rejected"
      ),
    [members]
  )
  const isTeacher = currentUser?.role === "teacher"
  const visibleTabs = useMemo(
    () => detailTabs.filter((tab) => !tab.teacherOnly || isTeacher),
    [isTeacher]
  )

  const loadDetailData = useCallback(async () => {
    const [currentUserData, organizationsData, membersData] = await Promise.all([
      getCurrentUser(),
      getMyOrganizations(),
      getOrganizationMembers(organizationId),
    ])
    const canManageOrganization = currentUserData.role === "teacher"
    const [waitlistData, invitesData, qrData] = canManageOrganization
      ? await Promise.all([
          getOrganizationWaitlist(organizationId).catch(() => []),
          getOrganizationInvites(organizationId).catch(() => []),
          getOrganizationQr(organizationId).catch(() => ""),
        ])
      : [[], [], ""]
    const organizationList = normalizeOrganizations(organizationsData)
    const activeOrganization =
      organizationList.find((item) => item.id === organizationId) ?? null

    return {
      currentUser: currentUserData,
      organization: activeOrganization,
      members: normalizeMembers(membersData),
      waitlist: normalizeMembers(waitlistData),
      invites: normalizeInvites(invitesData),
      qrValue: getQrValue(qrData),
    }
  }, [organizationId])

  const applyDetailData = useCallback((data: Awaited<ReturnType<typeof loadDetailData>>) => {
    setCurrentUser(data.currentUser)
    setOrganization(data.organization)
    setEditForm({
      name: data.organization?.name ?? "",
      description: data.organization?.description ?? "",
      subject: data.organization?.subject ?? "",
    })
    setMembers(data.members)
    setWaitlist(data.waitlist)
    setInvites(data.invites)
    setQrValue(data.qrValue)
  }, [])

  const loadDetail = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const data = await loadDetailData()

      applyDetailData(data)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo cargar el salon."

      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const loadInitialDetail = async () => {
      try {
        const data = await loadDetailData()

        if (!isMounted) return

        applyDetailData(data)
      } catch (error) {
        if (!isMounted) return

        const message =
          error instanceof Error
            ? error.message
            : "No se pudo cargar el salon."

        setError(message)
      } finally {
        if (!isMounted) return

        setIsLoading(false)
      }
    }

    void loadInitialDetail()

    return () => {
      isMounted = false
    }
  }, [applyDetailData, loadDetailData])

  const handleCopyCode = async () => {
    if (!organization?.join_code) return

    await navigator.clipboard.writeText(organization.join_code)
    setSuccessMessage("Codigo copiado al portapapeles.")
  }

  const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const email = inviteEmail.trim()

    if (!email) return

    try {
      setIsMutating(true)
      setError(null)
      setSuccessMessage(null)

      await inviteOrganizationMember(organizationId, email)
      setInviteEmail("")
      setSuccessMessage("Invitacion enviada correctamente.")
      const data = await getOrganizationInvites(organizationId)
      setInvites(normalizeInvites(data))
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo enviar la invitacion."

      setError(message)
    } finally {
      setIsMutating(false)
    }
  }

  const handleMemberStatus = async (
    studentId: string,
    status: "accepted" | "rejected"
  ) => {
    try {
      setMutatingStudentId(studentId)
      setError(null)
      setSuccessMessage(null)

      await updateOrganizationMemberStatus(organizationId, studentId, { status })
      setSuccessMessage(
        status === "accepted" ? "Alumno aceptado." : "Alumno rechazado."
      )
      const [membersData, waitlistData] = await Promise.all([
        getOrganizationMembers(organizationId),
        getOrganizationWaitlist(organizationId).catch(() => []),
      ])
      setMembers(normalizeMembers(membersData))
      setWaitlist(normalizeMembers(waitlistData))
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar al alumno."

      setError(message)
    } finally {
      setMutatingStudentId(null)
    }
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setIsMutating(true)
      setError(null)
      setSuccessMessage(null)

      await updateOrganization(organizationId, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        subject: editForm.subject.trim(),
      })
      setSuccessMessage("Salon actualizado correctamente.")
      await loadDetail()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo actualizar el salon."

      setError(message)
    } finally {
      setIsMutating(false)
    }
  }

  const handleDelete = async () => {
    const shouldDelete = window.confirm(
      "Eliminar este salon tambien eliminara sus miembros e invitaciones."
    )

    if (!shouldDelete) return

    try {
      setIsMutating(true)
      await deleteOrganization(organizationId)
      router.push("/dashboard/organizaciones")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo eliminar el salon."

      setError(message)
    } finally {
      setIsMutating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Cargando salon...
      </div>
    )
  }

  return (
    <section>
      <div className="mb-6">
        <Link
          href="/dashboard/organizaciones"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Volver a salones
        </Link>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Salon</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              {organization?.name ?? "Salon"}
            </h1>
            <p className="mt-2 max-w-3xl text-slate-600">
              {organization?.description || "Sin descripcion."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                {organization?.subject || "Sin asignatura"}
              </span>
              {organization?.join_code && (
                <button
                  type="button"
                  onClick={() => void handleCopyCode()}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {organization.join_code}
                </button>
              )}
            </div>
          </div>

          <div
            className={`grid gap-3 text-sm ${
              isTeacher ? "grid-cols-2 lg:min-w-56" : "grid-cols-1 lg:min-w-32"
            }`}
          >
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-slate-500">Miembros</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">
                {acceptedMembers.length}
              </p>
            </div>
            {isTeacher && (
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-slate-500">Espera</p>
                <p className="mt-1 text-2xl font-bold text-slate-950">
                  {waitlist.length}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

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

      <div className="mb-6 flex gap-2 overflow-x-auto">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "flashcards" && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <School className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-slate-950">
            Flashcards del salon
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
            Esta seccion queda preparada para conectar los endpoints de
            flashcards. Las tarjetas deben guardarse con el id de este salon
            para que todos los miembros aceptados puedan verlas.
          </p>
        </div>
      )}

      {activeTab === "members" && (
        <div
          className={`grid gap-4 ${
            isTeacher ? "xl:grid-cols-[minmax(0,1fr)_24rem]" : ""
          }`}
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <UsersRound className="h-5 w-5 text-blue-600" />
              <h2 className="font-semibold text-slate-950">Miembros</h2>
            </div>
            <div className="space-y-2">
              {acceptedMembers.length > 0 ? (
                acceptedMembers.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950">
                        {getMemberName(member)}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {member.email || member.user_id}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {member.role || "member"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  Todavia no hay miembros aceptados.
                </p>
              )}
            </div>
          </div>

          {isTeacher && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <UserCheck className="h-5 w-5 text-blue-600" />
                <h2 className="font-semibold text-slate-950">Lista de espera</h2>
              </div>
              <div className="space-y-2">
                {waitlist.length > 0 ? (
                  waitlist.map((member) => (
                    <div
                      key={member.user_id}
                      className="rounded-xl border border-slate-100 p-3"
                    >
                      <p className="truncate text-sm font-semibold text-slate-950">
                        {getMemberName(member)}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {member.email || member.user_id}
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            void handleMemberStatus(member.user_id, "accepted")
                          }
                          disabled={mutatingStudentId === member.user_id}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-100 disabled:opacity-60"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Aceptar
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void handleMemberStatus(member.user_id, "rejected")
                          }
                          disabled={mutatingStudentId === member.user_id}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60"
                        >
                          <UserX className="h-3.5 w-3.5" />
                          Rechazar
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                    No hay solicitudes pendientes.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {isTeacher && activeTab === "invites" && (
        <div className="grid gap-4 xl:grid-cols-[24rem_minmax(0,1fr)]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <h2 className="font-semibold text-slate-950">Invitar alumno</h2>
            </div>
            <form onSubmit={handleInvite} className="space-y-3">
              <input
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="correo@ejemplo.com"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20"
              />
              <button
                type="submit"
                disabled={!inviteEmail.trim() || isMutating}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isMutating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Enviar invitacion
              </button>
            </form>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
                <QrCode className="h-4 w-4 text-blue-600" />
                Codigo QR
              </div>
              {qrValue ? (
                <div className="space-y-3">
                  <div className="flex justify-center rounded-2xl border border-slate-200 bg-white p-4">
                    <Image
                      src={qrValue}
                      alt={`Codigo QR para unirse al salon ${
                        organization?.name ?? ""
                      }`}
                      width={192}
                      height={192}
                      unoptimized
                      className="h-48 w-48 rounded-lg object-contain"
                    />
                  </div>
                  {organization?.join_code && (
                    <div className="rounded-xl bg-white px-3 py-2 text-center">
                      <p className="text-xs font-medium text-slate-500">
                        Codigo de union
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-950">
                        {organization.join_code}
                      </p>
                    </div>
                  )}
                  <a
                    href={qrValue}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Abrir imagen del QR
                  </a>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  El backend no devolvio una URL de QR para este salon.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-950">
              Historial de invitaciones
            </h2>
            <div className="space-y-2">
              {invites.length > 0 ? (
                invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950">
                        {invite.email}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {invite.created_at || "Sin fecha"}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {getStatusLabel(invite.status)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  No hay invitaciones registradas.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {isTeacher && activeTab === "settings" && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <form
            onSubmit={handleSave}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="mb-4 font-semibold text-slate-950">Editar salon</h2>
            <div className="grid gap-3">
              <input
                value={editForm.name}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Nombre"
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20"
              />
              <input
                value={editForm.subject}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    subject: event.target.value,
                  }))
                }
                placeholder="Asignatura"
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20"
              />
              <textarea
                value={editForm.description}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Descripcion"
                rows={4}
                className="resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
            <button
              type="submit"
              disabled={isMutating}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isMutating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Guardar cambios
            </button>
          </form>

          <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-red-600">Zona de riesgo</h2>
            <p className="mt-2 text-sm text-slate-500">
              Eliminar el salon borra miembros e invitaciones asociadas.
            </p>
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={isMutating}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar salon
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
