import { Link } from '@tanstack/react-router'
import type { MessageSummary } from '../types'
import { PriorityBadge } from './priority-badge'

export function MessageList({ messages }: { messages: MessageSummary[] }) {
  if (messages.length === 0) {
    return <p className="text-sm text-read">No messages yet.</p>
  }
  return (
    <ul className="divide-y divide-hairline overflow-hidden rounded-lg border border-hairline bg-panel">
      {messages.map((m) => (
        <li key={m.id}>
          <Link
            to="/inbox/$messageId"
            params={{ messageId: m.id }}
            className="flex flex-col gap-1.5 px-5 py-4 transition-colors hover:bg-hairline focus-visible:-outline-offset-2"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-bright">{m.subject}</span>
              <PriorityBadge priority={m.priority} />
            </div>
            <span className="truncate text-sm text-read">
              {m.from} · {m.preview}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
