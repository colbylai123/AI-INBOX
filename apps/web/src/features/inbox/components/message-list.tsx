import { Link } from '@tanstack/react-router'
import type { MessageSummary } from '../types'
import { PriorityBadge } from './priority-badge'

export function MessageList({ messages }: { messages: MessageSummary[] }) {
  if (messages.length === 0) {
    return <p className="text-sm text-muted-foreground">No messages yet.</p>
  }
  return (
    <ul className="flex flex-col gap-3">
      {messages.map((m) => (
        <li key={m.id}>
          <Link
            to="/inbox/$messageId"
            params={{ messageId: m.id }}
            className="flex flex-col gap-1.5 rounded-2xl border bg-card/70 px-5 py-4 transition-colors hover:border-primary/40 hover:bg-card"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="truncate font-semibold">{m.subject}</span>
              <PriorityBadge priority={m.priority} />
            </div>
            <span className="truncate text-sm text-muted-foreground">
              {m.from} · {m.preview}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
