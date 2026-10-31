import { Link, useParams } from '@tanstack/react-router'
import {
  defaultRangeExtractor,
  observeElementRect,
  type Range,
  useVirtualizer,
} from '@tanstack/react-virtual'
import { CircleCheck } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'
import { useShortcuts } from '@/lib/use-shortcuts'
import { listTime } from '../lib/dates'
import { type Folder, folderNames } from '../lib/folders'
import { senderAddress, senderName } from '../lib/sender'
import type { MessageSummary } from '../types'
import { PriorityBadge } from './priority-badge'
import { SenderMark } from './sender-mark'

// A first guess at a row's height; each row is measured once it renders.
const ROW_ESTIMATE = 104

export function MessageList({
  messages,
  showAccount = false,
  filtered = false,
  folder,
  keyboard = true,
}: {
  messages: MessageSummary[]
  /** Say which account each email came to, for a list that mixes accounts. */
  showAccount?: boolean
  /** A priority or account filter is on, so an empty list doesn't mean an empty inbox. */
  filtered?: boolean
  /** The folder chip that's open. Undefined is the inbox. */
  folder?: Folder
  /** j and k move between rows. Off while an email is open, where they open the next one. */
  keyboard?: boolean
}) {
  if (messages.length === 0) return <InboxEmpty filtered={filtered} folder={folder} />
  return <MessageRows messages={messages} showAccount={showAccount} keyboard={keyboard} />
}

/**
 * The rows scroll inside the list card, and only the rows near view are in the page,
 * so a long inbox stays quick. Each row says its place in the whole list to screen readers.
 */
function MessageRows({
  messages,
  showAccount,
  keyboard,
}: {
  messages: MessageSummary[]
  showAccount: boolean
  keyboard: boolean
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  // The row that has focus stays rendered even when scrolled away, so focus isn't lost.
  const focusedRow = useRef<number | null>(null)
  // A row that j or k asked for before it was rendered.
  const pendingFocus = useRef<number | null>(null)
  // The open email's row, marked and kept in view as j and k on the email move on.
  const openId = useParams({ strict: false }).messageId
  const openRow = messages.findIndex((m) => m.id === openId)

  const rangeExtractor = useCallback(
    (range: Range) => {
      const rows = defaultRangeExtractor(range)
      const keep = [focusedRow.current, openRow].filter(
        (row): row is number =>
          row !== null && row >= 0 && row < range.count && !rows.includes(row),
      )
      return keep.length ? [...rows, ...keep].toSorted((a, b) => a - b) : rows
    },
    [openRow],
  )

  // The app doesn't use the React Compiler, which is what this rule protects.
  // oxlint-disable-next-line react/incompatible-library
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_ESTIMATE,
    getItemKey: (index) => messages[index]!.id,
    overscan: 6,
    rangeExtractor,
    // Until the card has a height (and in tests, which have no layout), assume the window's.
    observeElementRect: (instance, report) =>
      observeElementRect(instance, (rect) =>
        report(rect.height ? rect : { ...rect, height: window.innerHeight }),
      ),
  })

  useEffect(() => {
    if (openRow >= 0) virtualizer.scrollToIndex(openRow)
  }, [openRow, virtualizer])

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
  useShortcuts({ j: () => move(1), k: () => move(-1) }, keyboard)

  useEffect(() => {
    if (pendingFocus.current === null) return
    const link = linkAt(pendingFocus.current)
    if (!link) return
    pendingFocus.current = null
    link.focus()
  })

  return (
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
      <ul
        ref={listRef}
        aria-label="Messages"
        className="relative"
        style={{ height: virtualizer.getTotalSize() }}
        onFocus={(event) => {
          const row = event.target.closest<HTMLElement>('[data-index]')
          focusedRow.current = row ? Number(row.dataset.index) : null
        }}
        onBlur={(event) => {
          if (!listRef.current?.contains(event.relatedTarget)) focusedRow.current = null
        }}
      >
        {virtualizer.getVirtualItems().map((item) => (
          <li
            key={item.key}
            ref={virtualizer.measureElement}
            data-index={item.index}
            aria-posinset={item.index + 1}
            aria-setsize={messages.length}
            className="absolute inset-x-0 top-0 pb-1"
            style={{ transform: `translateY(${item.start}px)` }}
          >
            <MessageRow message={messages[item.index]!} showAccount={showAccount} />
          </li>
        ))}
      </ul>
    </div>
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
      // Carries the folder, filters and search, so the list stays as it is.
      search
      // Closing the email with Esc brings focus back to its row.
      data-message-id={m.id}
      className="flex gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-muted focus-visible:-outline-offset-2 aria-[current=page]:bg-raised"
    >
      <SenderMark from={m.from} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-baseline justify-between gap-3">
          <span className="truncate text-interface font-semibold tracking-tight">
            {senderName(m.from)}
          </span>
          <span className="shrink-0 text-label text-muted-foreground tabular-nums">
            {listTime(m.receivedAt)}
          </span>
        </span>
        <span className="truncate text-label text-muted-foreground">
          {senderAddress(m.from)}
          {showAccount && m.account && <> to {m.account.email}</>}
        </span>
        <span className="mt-1.5 flex items-center gap-2">
          <span className="truncate text-metadata font-semibold">{m.subject}</span>
          <span className="ml-auto flex shrink-0 items-center gap-1.5">
            {m.approvedAt && (
              <span className="flex items-center gap-1 text-label font-medium text-muted-foreground">
                <CircleCheck className="size-3.5" aria-hidden />
                <span className="sr-only">Reply sent</span>
              </span>
            )}
            <PriorityBadge priority={m.priority} />
          </span>
        </span>
        {/* The AI's one-line summary; the raw preview until it has one. */}
        <span className="truncate text-metadata text-muted-foreground">
          {m.summary ?? m.preview}
        </span>
      </span>
    </Link>
  )
}

// What an empty folder says. Inbox has its own text, below.
const emptyFolders: Record<Folder, { title: string; body: string }> = {
  sent: { title: 'No sent replies yet', body: 'Replies you approve and send show here.' },
  drafts: {
    title: 'No drafts waiting',
    body: "Drafted replies you haven't approved yet show here. Nothing is sent until you approve it.",
  },
  favorites: {
    title: 'No favorites',
    body: 'Star an email to keep it here. Stars stay in this browser.',
  },
  archive: {
    title: 'Archive is empty',
    body: "Emails you archive leave the inbox list in this browser. Your mailbox isn't changed.",
  },
  deleted: {
    title: 'Nothing deleted',
    body: "Emails you delete leave the inbox list in this browser. Your mailbox isn't changed.",
  },
  spam: {
    title: 'Nothing in Spam',
    body: "This inbox doesn't mark spam. Your mail provider's spam folder isn't shown here.",
  },
  junk: {
    title: 'Nothing in Junk',
    body: "This inbox doesn't mark junk. Your mail provider's junk folder isn't shown here.",
  },
}

function InboxEmpty({ filtered, folder }: { filtered: boolean; folder?: Folder }) {
  const text = folder
    ? emptyFolders[folder]
    : filtered
      ? {
          title: 'No messages match these filters',
          body: 'Choose a different priority or account in the filters to see the rest of your inbox.',
        }
      : {
          title: 'No messages yet',
          body: 'New mail from your connected accounts lands here, most important first. Each one comes with a short summary and, when it needs an answer, a drafted reply for you to review. Nothing is sent until you approve it.',
        }
  return (
    <div className="px-5 pt-2 pb-6">
      <h2 className="text-interface font-semibold">{text.title}</h2>
      <p className="mt-1 text-metadata text-muted-foreground">{text.body}</p>
      {folder && filtered && (
        <p className="mt-2 text-metadata text-muted-foreground">
          A filter is on, so some of {folderNames[folder]} may be hidden.
        </p>
      )}
    </div>
  )
}
