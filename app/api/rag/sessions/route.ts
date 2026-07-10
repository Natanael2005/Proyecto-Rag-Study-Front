import type { NextRequest } from "next/server"
import { proxyRagRequest } from "@/lib/rag-proxy"

export async function GET(request: NextRequest) {
  return proxyRagRequest(request, "/rag/sessions", {
    unauthorizedMessage:
      "No se encontro un token de sesion para consultar salas de estudio.",
  })
}

export async function POST(request: NextRequest) {
  return proxyRagRequest(request, "/rag/sessions", {
    unauthorizedMessage:
      "No se encontro un token de sesion para crear salas de estudio.",
  })
}
