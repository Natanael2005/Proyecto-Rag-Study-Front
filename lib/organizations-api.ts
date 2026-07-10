import { ApiRequestError } from "@/lib/auth-api"

export type Organization = {
  id: string
  name: string
  description?: string
  subject?: string
  career_id?: number
  created_by?: string
  join_code?: string
  created_at?: string
}

export type OrganizationMember = {
  organization_id: string
  user_id: string
  role?: string
  status?: string
  joined_at?: string
  first_name?: string
  last_name?: string
  email?: string
}

export type OrganizationInvite = {
  id: string
  organization_id: string
  email: string
  invited_by?: string
  status?: string
  created_at?: string
}

export type CreateOrganizationPayload = {
  name: string
  description: string
  subject: string
}

export type UpdateOrganizationPayload = Partial<CreateOrganizationPayload>

type UpdateMemberStatusPayload = {
  status: "accepted" | "rejected"
}

async function parseResponseData(response: Response) {
  const contentType = response.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    return response.json().catch(() => null)
  }

  return response.text().catch(() => null)
}

function getErrorMessage(data: unknown, fallbackMessage: string) {
  if (typeof data === "string" && data.trim() !== "") {
    return data
  }

  const errorData = data as
    | {
        detail?: string | { msg?: string }[]
        message?: string
        error?: string
      }
    | null

  if (typeof errorData?.detail === "string") {
    return errorData.detail
  }

  if (Array.isArray(errorData?.detail) && errorData.detail.length > 0) {
    return errorData.detail[0].msg ?? fallbackMessage
  }

  return errorData?.message || errorData?.error || fallbackMessage
}

async function requestOrganizations(
  endpoint: string,
  options: RequestInit = {}
) {
  const headers = new Headers(options.headers)

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json")
  }

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(endpoint, {
    ...options,
    credentials: "include",
    headers,
  })
  const data = await parseResponseData(response)

  if (!response.ok) {
    throw new ApiRequestError(
      getErrorMessage(data, "No se pudo completar la accion de salones."),
      response.status,
      data
    )
  }

  return data
}

function getOrganizationEndpoint(organizationId: string) {
  return `/api/organizations/${encodeURIComponent(organizationId)}`
}

export function getMyOrganizations() {
  return requestOrganizations("/api/organizations/me", {
    method: "GET",
  })
}

export function createOrganization(payload: CreateOrganizationPayload) {
  return requestOrganizations("/api/organizations", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function joinOrganization(code: string) {
  return requestOrganizations("/api/organizations/join", {
    method: "POST",
    body: JSON.stringify({ code }),
  })
}

export function updateOrganization(
  organizationId: string,
  payload: UpdateOrganizationPayload
) {
  return requestOrganizations(getOrganizationEndpoint(organizationId), {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export function deleteOrganization(organizationId: string) {
  return requestOrganizations(getOrganizationEndpoint(organizationId), {
    method: "DELETE",
  })
}

export function getOrganizationMembers(organizationId: string) {
  return requestOrganizations(
    `${getOrganizationEndpoint(organizationId)}/members`,
    {
      method: "GET",
    }
  )
}

export function getOrganizationWaitlist(organizationId: string) {
  return requestOrganizations(
    `${getOrganizationEndpoint(organizationId)}/waitlist`,
    {
      method: "GET",
    }
  )
}

export function updateOrganizationMemberStatus(
  organizationId: string,
  studentId: string,
  payload: UpdateMemberStatusPayload
) {
  return requestOrganizations(
    `${getOrganizationEndpoint(organizationId)}/members/${encodeURIComponent(
      studentId
    )}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  )
}

export function inviteOrganizationMember(organizationId: string, email: string) {
  return requestOrganizations(
    `${getOrganizationEndpoint(organizationId)}/invite`,
    {
      method: "POST",
      body: JSON.stringify({ email }),
    }
  )
}

export function getOrganizationInvites(organizationId: string) {
  return requestOrganizations(
    `${getOrganizationEndpoint(organizationId)}/invites`,
    {
      method: "GET",
    }
  )
}

export function getOrganizationQr(organizationId: string) {
  return requestOrganizations(`${getOrganizationEndpoint(organizationId)}/qr`, {
    method: "GET",
  })
}
