import { ResetPasswordClient } from "./reset-password-client"

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string | string[]
  }>
}

function getSingleParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? ""
  }

  return value ?? ""
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams

  return <ResetPasswordClient token={getSingleParam(params.token)} />
}
