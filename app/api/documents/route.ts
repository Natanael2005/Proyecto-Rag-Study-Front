import type { NextRequest } from "next/server"

import { proxyRagRequest } from "@/lib/rag-proxy"

export async function GET(request: NextRequest) {
  return proxyRagRequest(request, "/documents/", {
    unauthorizedMessage:
      "No se encontro un token de sesion para consultar documentos.",
  })

}

export async function POST(request: NextRequest) {
  const formData = await request.formData()


  return proxyRagRequest(request, "/documents/", {
    body: formData,
    method: "POST",
    unauthorizedMessage: "No se encontro un token de sesion para subir PDFs.",
  })

}
