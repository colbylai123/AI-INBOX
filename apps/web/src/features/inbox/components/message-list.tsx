import { Link } from '@tanstack/react-router'
import type { MessageSummary } from '../types'
import { PriorityBadge } from './priority-badge'

export function MessageList({ messages }: { messages: MessageSummary[] }) {
  if (messages.length === 0) {
    return <p className="text-sm text-muted-foreground">No messages yet.</p>
  }
  return (
    <ul className="divide-y rounded-lg border">
      {messages.map((m) => (
        <li key={m.id}>
          <Link
            to="/inbox/$messageId"
            params={{ messageId: m.id }}
            className="flex flex-col gap-1 px-4 py-3 hover:bg-accent"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-medium">{m.subject}</span>
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
