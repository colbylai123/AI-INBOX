import { Link } from '@tanstack/react-router'
import { defaultRangeExtractor, type Range, useWindowVirtualizer } from '@tanstack/react-virtual'
import { CircleCheck } from 'lucide-react'
import { type RefObject, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useShortcuts } from '@/lib/use-shortcuts'
import { cn } from '@/lib/utils'
import type { MessageSummary } from '../types'
import { PriorityBadge } from './priority-badge'

// A first guess at a row's height; each row is measured once it renders.
const ROW_ESTIMATE = 92

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
  if (messages.length === 0) return <InboxEmpty filtered={filtered} />
  return <MessageRows messages={messages} showAccount={showAccount} />
}

/**
 * Only the rows near the screen are in the page, so a long inbox stays quick. The
 * page scrolls as usual; each row says its place in the whole list to screen readers.
 */
function MessageRows({
  messages,
  showAccount,
}: {
  messages: MessageSummary[]
  showAccount: boolean
}) {
  const listRef = useRef<HTMLUListElement>(null)
  // The row that has focus stays rendered even when scrolled away, so focus isn't lost.
  const focusedRow = useRef<number | null>(null)
  // A row that j or k asked for before it was rendered.
  const pendingFocus = useRef<number | null>(null)

  const rangeExtractor = useCallback((range: Range) => {
    const rows = defaultRangeExtractor(range)
    const keep = focusedRow.current
    if (keep === null || keep >= range.count || rows.includes(keep)) return rows
    return [...rows, keep].toSorted((a, b) => a - b)
  }, [])

  // The app doesn't use the React Compiler, which is what this rule protects.
  // oxlint-disable-next-line react/incompatible-library
  const virtualizer = useWindowVirtualizer({
    count: messages.length,
    estimateSize: () => ROW_ESTIMATE,
    getItemKey: (index) => messages[index]!.id,
    overscan: 6,
    scrollMargin: usePageTop(listRef),
    rangeExtractor,
  })

  const linkAt = (index: number) =>
    listRef.current?.querySelector<HTMLAnchorElement>(`[data-index="${index}"] a`)

  // j and k move between rows, Enter opens one (it's a link).
  const move = (by: number) => {
    const row = document.activeElement?.closest<HTMLElement>('[data-index]')
    const at = row && listRef.current?.contains(row) ? Number(row.dataset.index) : -1
    const next = at === -1 ? 0 : Math.min(Math.max(at + by, 0), messages.length - 1)
    const link = linkAt(next)
    if (link) return link.focus()
    pendingFocus.current = next
    virtualizer.scrollToIndex(next)
  }
  useShortcuts({ j: () => move(1), k: () => move(-1) })

  useEffect(() => {
    if (pendingFocus.current === null) return
    const link = linkAt(pendingFocus.current)
    if (!link) return
    pendingFocus.current = null
    link.focus()
  })

  return (
    <ul
      ref={listRef}
      aria-label="Messages"
      className="relative overflow-hidden rounded-lg border border-card-edge bg-card shadow-panel"
      style={{ height: virtualizer.getTotalSize() }}
      onFocus={(event) => {
        const row = event.target.closest<HTMLElement>('[data-index]')
        focusedRow.current = row ? Number(row.dataset.index) : null
      }}
      onBlur={(event) => {
        if (!listRef.current?.contains(event.relatedTarget)) focusedRow.current = null
      }}
    >
      {virtualizer.getVirtualItems().map((item) => {
        const m = messages[item.index]!
        return (
          <li
            key={item.key}
            ref={virtualizer.measureElement}
            data-index={item.index}
            aria-posinset={item.index + 1}
            aria-setsize={messages.length}
            className={cn(
              'absolute inset-x-0 top-0',
              item.index < messages.length - 1 && 'border-b border-border',
            )}
            style={{ transform: `translateY(${item.start - virtualizer.options.scrollMargin}px)` }}
          >
            <MessageRow message={m} showAccount={showAccount} />
          </li>
        )
      })}
    </ul>
  )
}

function MessageRow({
  message: m,
  showAccount,
}: {
  message: MessageSummary
  showAccount: boolean
}) {
  return (
    <Link
      to="/inbox/$messageId"
      params={{ messageId: m.id }}
      // Carries the filter and search, so the way back keeps them.
      search
      className="flex flex-col gap-0.5 px-5 py-3.5 transition-colors hover:bg-muted focus-visible:-outline-offset-2"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-interface font-medium tracking-tight">{m.subject}</span>
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
      <span className="truncate text-metadata text-muted-foreground">{m.summary ?? m.preview}</span>
    </Link>
  )
}

/**
 * Where the list starts on the page, which the virtualizer needs because the page
 * scrolls, not the list. Things above it (the checklist, a banner) can load or close
 * without re-rendering the list, so it re-measures whenever the page changes size.
 */
function usePageTop(ref: RefObject<HTMLElement | null>) {
  const [top, setTop] = useState(0)
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const measure = () => setTop(element.getBoundingClientRect().top + window.scrollY)
    measure()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    observer?.observe(document.body)
    window.addEventListener('resize', measure)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [ref])
  return top
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
