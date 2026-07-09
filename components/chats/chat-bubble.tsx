import { Loader2, Trash2 } from "lucide-react"

export type ChatMessageRole = "assistant" | "user"

type ChatBubbleProps = {
  canDelete?: boolean
  role: ChatMessageRole
  content: string
  isDeleting?: boolean
  onDelete?: () => void
}

export function ChatBubble({
  canDelete = false,
  role,
  content,
  isDeleting = false,
  onDelete,
}: ChatBubbleProps) {
  const isUser = role === "user"

  const deleteButton = canDelete ? (
    <button
      type="button"
      onClick={onDelete}
      disabled={isDeleting}
      className="mb-1 rounded-lg p-1.5 text-slate-400 opacity-100 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60 sm:opacity-0 sm:group-hover:opacity-100"
      aria-label="Eliminar mensaje"
    >
      {isDeleting ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </button>
  ) : null

  return (
    <div
      className={`group flex items-end gap-2 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && deleteButton}

      <div
        className={`max-w-[75%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-800"
        }`}
      >
        {content}
      </div>

      {isUser && deleteButton}
    </div>
  )
}
