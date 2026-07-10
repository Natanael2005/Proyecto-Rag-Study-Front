import { ResendVerificationClient } from "./resend-verification-client"

type ResendVerificationPageProps = {
  searchParams: Promise<{
    email?: string | string[]
  }>
}

function getSingleParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? ""
  }

  return value ?? ""
}

export default async function ResendVerificationPage({
  searchParams,
}: ResendVerificationPageProps) {
  const params = await searchParams

  return (
    <ResendVerificationClient initialEmail={getSingleParam(params.email)} />
  )
}
