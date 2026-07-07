type RegisterStudentPayload = {
  career_id: number
  email: string
  first_name: string
  last_name: string
  matricula: string
  password: string
}

type RegisterTeacherPayload = {
  career_id: number
  email: string
  first_name: string
  last_name: string
  password: string
}

type LoginPayload = {
  email: string
  password: string
  mfa_code?: string
}

type ResendVerificationPayload = {
  email: string
}

export type AuthUser = {
  id: string
  first_name: string
  last_name: string
  email: string
  role: "student" | "teacher" | string
  is_verified: boolean
  is_mfa_enabled: boolean
}

type ApiValidationError = {
  detail?:
    | string
    | {
        loc?: Array<string | number>
        msg?: string
        type?: string
        input?: string
        ctx?: Record<string, unknown>
      }[]
}

type ApiErrorResponse = {
  message?: string
  error?: string
} & ApiValidationError

export class ApiRequestError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data: unknown) {
    super(message)
    this.name = "ApiRequestError"
    this.status = status
    this.data = data
    Object.setPrototypeOf(this, ApiRequestError.prototype)
  }
}

function getApiUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  if (!apiUrl) {
    throw new Error("Falta configurar NEXT_PUBLIC_API_URL en .env.local")
  }

  return apiUrl
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

  const errorData = data as ApiErrorResponse | null

  if (typeof errorData?.detail === "string") {
    return errorData.detail
  }

  if (Array.isArray(errorData?.detail) && errorData.detail.length > 0) {
    return errorData.detail[0].msg ?? fallbackMessage
  }

  return errorData?.message || errorData?.error || fallbackMessage
}

async function requestJson(endpoint: string, options: RequestInit = {}) {
  const apiUrl = getApiUrl()

  const headers = new Headers(options.headers)

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json")
  }

  const response = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await parseResponseData(response)

  if (!response.ok) {
    throw new ApiRequestError(
      getErrorMessage(data, "Ocurrió un error. Inténtalo de nuevo."),
      response.status,
      data
    )
  }

  return data
}

export function registerStudent(payload: RegisterStudentPayload) {
  return requestJson("/auth/register/student", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function registerTeacher(payload: RegisterTeacherPayload) {
  return requestJson("/auth/register/teacher", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function loginUser(payload: LoginPayload) {
  const apiUrl = getApiUrl()

  const response = await fetch(`${apiUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  })

  const data = await parseResponseData(response)

  if (response.status === 202) {
    throw new ApiRequestError(
      getErrorMessage(data, "MFA requerido. Esta función se conectará después."),
      202,
      data
    )
  }

  if (!response.ok) {
    throw new ApiRequestError(
      getErrorMessage(data, "Correo o contraseña incorrectos."),
      response.status,
      data
    )
  }

  return data
}

export function getCurrentUser(): Promise<AuthUser> {
  return requestJson("/users/me", {
    method: "GET",
    credentials: "include",
  }) as Promise<AuthUser>
}

export function refreshSession() {
  return requestJson("/auth/refresh", {
    method: "POST",
    credentials: "include",
  })
}

export function logoutUser() {
  return requestJson("/auth/logout", {
    method: "POST",
    credentials: "include",
  })
}

export function resendVerificationEmail(payload: ResendVerificationPayload) {
  return requestJson("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function verifyEmail(token: string) {
  const apiUrl = getApiUrl()

  const response = await fetch(
    `${apiUrl}/auth/verify-email?token=${encodeURIComponent(token)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json, text/html, text/plain",
      },
    }
  )

  const data = await parseResponseData(response)

  if (!response.ok) {
    throw new ApiRequestError(
      getErrorMessage(data, "No se pudo verificar el correo."),
      response.status,
      data
    )
  }

  return data
}