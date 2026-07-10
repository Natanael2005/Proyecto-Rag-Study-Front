import { JoinInvitationClient } from "./join-invitation-client"

type JoinPageProps = {
  searchParams: Promise<{
    code?: string | string[]
  }>
}

export default async function JoinPage({ searchParams }: JoinPageProps) {
  const params = await searchParams
  const code = Array.isArray(params.code) ? params.code[0] : params.code

  return <JoinInvitationClient code={code ?? ""} />
}
