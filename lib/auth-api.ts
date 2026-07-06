type RegisterStudentPayload = {
  career_id: number;
  email: string;
  first_name: string;
  last_name: string;
  matricula: string;
  password: string;
};

type RegisterTeacherPayload = {
  career_id: number;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
};


type ApiValidationError = {
  detail?:
    | string
    | {
        loc?: Array<string | number>;
        msg?: string;
        type?: string;
        input?: string;
        ctx?: Record<string, unknown>;
      }[];
};

type ApiErrorResponse = {
  message?: string;
  error?: string;
} & ApiValidationError;

async function requestRegister(endpoint: string, payload: unknown) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("Falta configurar NEXT_PUBLIC_API_URL en .env.local");
  }

  const response = await fetch(`${apiUrl}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorData = data as ApiErrorResponse | null;

    if (typeof errorData?.detail === "string") {
      throw new Error(errorData.detail);
    }

    if (Array.isArray(errorData?.detail) && errorData.detail.length > 0) {
      throw new Error(errorData.detail[0].msg ?? "Error de validación.");
    }

    throw new Error(
      errorData?.message ||
        errorData?.error ||
        "No se pudo crear la cuenta. Inténtalo de nuevo."
    );
  }

  return data;
}

export function registerStudent(payload: RegisterStudentPayload) {
  return requestRegister("/auth/register/student", payload);
}

export function registerTeacher(payload: RegisterTeacherPayload) {
  return requestRegister("/auth/register/teacher", payload);
}