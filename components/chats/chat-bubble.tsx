import type { ReactNode } from "react"
import { Loader2, Trash2 } from "lucide-react"

export type ChatMessageRole = "assistant" | "user"

type ChatBubbleProps = {
  canDelete?: boolean
  role: ChatMessageRole
  content: string
  isDeleting?: boolean
  onDelete?: () => void
}

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    }

    return <span key={index}>{part}</span>
  })
}

function MarkdownMessage({ content }: { content: string }) {
  const lines = content.split("\n")
  const elements: ReactNode[] = []
  let listItems: string[] = []

  const flushList = () => {
    if (listItems.length === 0) return

    elements.push(
      <ul key={`list-${elements.length}`} className="my-2 list-disc space-y-1 pl-5">
        {listItems.map((item, index) => (
          <li key={index}>{renderInlineMarkdown(item)}</li>
        ))}
      </ul>
    )
    listItems = []
  }

  lines.forEach((line, index) => {
    const trimmedLine = line.trim()

    if (!trimmedLine || trimmedLine === "***" || trimmedLine === "---") {
      flushList()
      return
    }

    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/)

    if (headingMatch) {
      flushList()

      const level = headingMatch[1].length
      const heading = headingMatch[2]
      const className =
        level <= 3
          ? "mt-4 text-base font-bold text-slate-950"
          : "mt-3 text-sm font-bold text-slate-900"

      elements.push(
        <p key={`heading-${index}`} className={className}>
          {renderInlineMarkdown(heading)}
        </p>
      )
      return
    }

    const bulletMatch = trimmedLine.match(/^[-*]\s+(.+)$/)

    if (bulletMatch) {
      listItems.push(bulletMatch[1])
      return
    }

    flushList()
    elements.push(
      <p key={`paragraph-${index}`} className="my-2 first:mt-0 last:mb-0">
        {renderInlineMarkdown(trimmedLine)}
      </p>
    )
  })

  flushList()

  return <div className="space-y-1">{elements}</div>
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
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-800"
        }`}
      >
        {isUser ? content : <MarkdownMessage content={content} />}
      </div>

      {isUser && deleteButton}
    </div>
  )
}
