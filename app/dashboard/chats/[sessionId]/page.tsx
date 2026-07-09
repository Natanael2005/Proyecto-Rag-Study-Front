import { ChatSessionRoom } from "@/components/chats/chat-session-room"

type ChatSessionPageProps = {
  params: Promise<{
    sessionId: string
  }>
}

export default async function ChatSessionPage({ params }: ChatSessionPageProps) {
  const { sessionId } = await params

  return <ChatSessionRoom sessionId={sessionId} />
}
