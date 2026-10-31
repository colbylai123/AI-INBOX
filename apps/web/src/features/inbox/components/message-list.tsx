import { Link } from '@tanstack/react-router'
import { CircleCheck } from 'lucide-react'
import { useRef } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useShortcuts } from '@/lib/use-shortcuts'
import type { MessageSummary } from '../types'
import { PriorityBadge } from './priority-badge'

export function MessageList({
  messages,
  showAccount = false,
  filtered = false,
}: {
  messages: MessageSummary[]
  /** Say which account each email came to, for a list that mixes accounts. */
  showAccount?: boolean
  /** A priority or account filter is on, so an empty list doesn't mean an empty inbox. */
  filtered?: boolean
}) {
  const listRef = useRef<HTMLUListElement>(null)

  // j and k move between rows, Enter opens one (it's a link).
  const move = (by: number) => {
    const links = [...(listRef.current?.querySelectorAll('a') ?? [])]
    const at = links.indexOf(document.activeElement as HTMLAnchorElement)
    const next = at === -1 ? 0 : Math.min(Math.max(at + by, 0), links.length - 1)
    links[next]?.focus()
  }
  useShortcuts({ j: () => move(1), k: () => move(-1) }, messages.length > 0)

  if (messages.length === 0) return <InboxEmpty filtered={filtered} />
  return (
    <ul
      ref={listRef}
      aria-label="Messages"
      className="divide-y divide-border overflow-hidden rounded-lg border border-white/65 bg-card shadow-panel"
    >
      {messages.map((m) => (
        <li key={m.id}>
          <Link
            to="/inbox/$messageId"
            params={{ messageId: m.id }}
            // Carries the filter and search, so the way back keeps them.
            search
            className="flex flex-col gap-0.5 px-5 py-3.5 transition-colors hover:bg-muted focus-visible:-outline-offset-2"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-interface font-medium tracking-tight">
                {m.subject}
              </span>
              <span className="flex shrink-0 items-center gap-2">
                {m.approvedAt && (
                  <span className="flex items-center gap-1 text-label font-medium text-muted-foreground">
                    <CircleCheck className="size-3.5" aria-hidden />
                    {/* Icon only on phones, where the subject needs the room. */}
                    <span className="max-sm:sr-only">Approved</span>
                  </span>
                )}
                <PriorityBadge priority={m.priority} />
              </span>
            </div>
            <span className="truncate text-metadata text-muted-foreground">
              {m.from}
              {showAccount && m.account && <> to {m.account.email}</>}
            </span>
            {/* The AI's one-line summary; the raw preview until it has one. Quieter than the subject. */}
            <span className="truncate text-metadata text-muted-foreground">
              {m.summary ?? m.preview}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

function InboxEmpty({ filtered }: { filtered: boolean }) {
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        {filtered ? (
          <>
            <CardTitle>No messages match these filters</CardTitle>
            <CardDescription>
              Choose a different priority or account above to see the rest of your inbox.
            </CardDescription>
          </>
        ) : (
          <>
            <CardTitle>No messages yet</CardTitle>
            <CardDescription>
              New mail from your connected accounts lands here, most important first. Each one comes
              with a short summary and, when it needs an answer, a drafted reply for you to review.
              Nothing is sent until you approve it.
            </CardDescription>
          </>
        )}
      </CardHeader>
    </Card>
  )
}
