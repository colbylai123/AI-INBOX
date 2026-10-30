import { Link } from '@tanstack/react-router'
import { CircleCheck } from 'lucide-react'
import type { MessageSummary } from '../types'
import { PriorityBadge } from './priority-badge'

export function MessageList({ messages }: { messages: MessageSummary[] }) {
  if (messages.length === 0) {
    return <p className="text-sm text-muted-foreground">No messages yet.</p>
  }
  return (
    <ul
      aria-label="Messages"
      className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card shadow-panel"
    >
      {messages.map((m) => (
        <li key={m.id}>
          <Link
            to="/inbox/$messageId"
            params={{ messageId: m.id }}
            className="flex flex-col gap-1 px-5 py-4 transition-colors hover:bg-muted focus-visible:-outline-offset-2"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-interface font-semibold">{m.subject}</span>
              <span className="flex shrink-0 items-center gap-2">
                {m.approvedAt && (
                  <span className="flex items-center gap-1 text-label font-medium text-muted-foreground">
                    <CircleCheck className="size-3.5 text-primary" aria-hidden /> Approved
                  </span>
                )}
                <PriorityBadge priority={m.priority} />
              </span>
            </div>
            <span className="truncate text-metadata text-muted-foreground">{m.from}</span>
            {/* The AI's one-line summary; the raw preview until it has one. */}
            <span className="truncate text-sm text-muted-foreground">{m.summary ?? m.preview}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
