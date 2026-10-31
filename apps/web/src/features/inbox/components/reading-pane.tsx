import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import {
  Archive,
  ArchiveRestore,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock,
  Ellipsis,
  Reply,
  Send,
  Star,
  Tag,
  Trash2,
  Undo2,
  type LucideIcon,
} from 'lucide-react'
import { type ReactNode, useEffect, useId, useRef, useState } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { useDisclosure } from '@/lib/use-disclosure'
import { useShortcuts } from '@/lib/use-shortcuts'
import { cn } from '@/lib/utils'
import { useAdjacent } from '../hooks/use-inbox-list'
import { useSaveDraft } from '../hooks/use-save-draft'
import { fullDate } from '../lib/dates'
import { highlight } from '../lib/highlight'
import { moveTo, placeOf, toggleStar, useLocalFolders } from '../lib/local-folders'
import {
  dismissReply,
  holdSend,
  UNDO_SECONDS,
  undoSend,
  useOutgoingReply,
  useSecondsLeft,
} from '../lib/outgoing-replies'
import { senderAddress, senderName } from '../lib/sender'
import type { Message } from '../types'
import { DraftEditor } from './draft-editor'
import { FilledFormView } from './filled-form'
import { PriorityBadge } from './priority-badge'
import { SenderMark } from './sender-mark'

/**
 * The open email, in the reading card beside the list: the email, then the AI's
 * draft and filled form, which can be edited in place, then Approve & send.
 *
 * Human-in-the-loop rule: the AI only drafts. Nothing is sent until the user clicks
 * Approve & send, and even then the reply waits UNDO_SECONDS so the click can be
 * taken back. Saving edits never sends, and no other control here sends anything.
 */
export function ReadingPane({ message }: { message: Message }) {
  const reply = useOutgoingReply(message.id)
  const seconds = useSecondsLeft(reply)
  const save = useSaveDraft(message.id)
  const [editing, setEditing] = useState(false)
  const [showSources, setShowSources] = useState(false)
  const editorId = useId()
  const subjectId = useId()
  const navigate = useNavigate()
  const adjacent = useAdjacent(message.id)
  const local = useLocalFolders()
  const place = placeOf(local, message.id)
  const starred = local.starred.includes(message.id)
  const sources = showSources && !editing ? (message.filledForm?.fields ?? []) : []

  // The send waits for the inbox to refetch, so approvedAt is already set once it's sent.
  const approved = !!message.approvedAt
  const held = reply?.status === 'held'
  const busy = held || reply?.status === 'sending'
  const canEdit = !approved && !!message.draftReply && !busy
  const startEditing = () => {
    dismissReply(message.id)
    setEditing(true)
  }

  // No shortcut approves: sending always takes a click on Approve & send. None of
  // these run while editing, so a stray key can't leave unsaved changes behind.
  useShortcuts(
    {
      ...(canEdit && { e: startEditing }),
      j: () => adjacent.open(1),
      k: () => adjacent.open(-1),
      Escape: () => void navigate({ to: '/inbox', search: true }),
    },
    !editing,
  )

  // "New email" opens this email's draft for editing through the history entry.
  const editRequest = useRouterState({ select: (state) => state.location.state.editDraft })
  useEffect(() => {
    if (editRequest && canEdit) startEditing()
    // Only a new request opens the editor, not a change in what can be edited.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [editRequest])

  // On phones the reading card sits under the list, so an opened email scrolls into view.
  const cardRef = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!window.matchMedia?.('(max-width: 1049px)').matches) return
    // After the router's own scroll to the top of the page on navigation.
    const frame = requestAnimationFrame(() => cardRef.current?.scrollIntoView?.({ block: 'start' }))
    return () => cancelAnimationFrame(frame)
  }, [message.id])

  // Only words from the email are marked in it; a document's words are quoted under the value.
  const phrases = sources.flatMap((field) =>
    field.source && !field.sourceMaterial ? [field.source] : [],
  )

  return (
    <article ref={cardRef} aria-labelledby={subjectId} className="flex min-h-0 flex-1 flex-col">
      <Toolbar message={message} place={place} adjacent={adjacent} />

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 sm:px-7">
        <div className="flex flex-wrap items-center gap-3 pt-5">
          <SenderMark from={message.from} className="size-11" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-interface font-semibold">
              {highlight(senderName(message.from), phrases)}
            </p>
            <p className="truncate text-metadata text-muted-foreground">
              {highlight(senderAddress(message.from), phrases)}
              {message.account && <> to {message.account.email}</>}
            </p>
          </div>
          {/* Under the name on phones, where the row is too narrow for it. */}
          <p className="order-last w-full pl-14 text-metadata text-muted-foreground tabular-nums sm:order-none sm:w-auto sm:pl-0">
            {fullDate(message.receivedAt)}
          </p>
          <div className="flex items-center">
            <IconButton
              icon={Star}
              label="Star"
              pressed={starred}
              onClick={() => toggleStar(message.id)}
              iconClassName={starred ? 'fill-current text-primary' : undefined}
            />
            <IconButton
              icon={Reply}
              label="Edit the reply"
              disabled={!canEdit || editing}
              onClick={startEditing}
            />
            <MoreMenu message={message} />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-start gap-x-3 gap-y-2">
          <h1
            id={subjectId}
            className="min-w-0 flex-1 font-display text-2xl leading-tight font-semibold tracking-[-0.02em] text-balance"
          >
            {message.subject}
          </h1>
          <PriorityBadge priority={message.priority} />
        </div>
        {(message.summary || message.priorityReason) && (
          <dl className="mt-3 grid gap-x-3 gap-y-1 text-metadata sm:grid-cols-[auto_1fr]">
            {message.summary && (
              <>
                <dt className="font-semibold text-muted-foreground">Summary</dt>
                <dd>{message.summary}</dd>
              </>
            )}
            {message.priorityReason && (
              <>
                <dt className="font-semibold text-muted-foreground">Why {message.priority}</dt>
                <dd>{message.priorityReason}</dd>
              </>
            )}
          </dl>
        )}

        <div className="mt-5 text-interface leading-relaxed whitespace-pre-wrap">
          {highlight(message.body, phrases)}
        </div>

        <section aria-label="Draft" className="mt-7 rounded-2xl bg-raised p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-label font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              Draft
            </h2>
            {canEdit && !editing && (
              <Button key="edit" variant="ghost" size="sm" onClick={startEditing}>
                Edit
              </Button>
            )}
          </div>
          {editing ? (
            <DraftEditor
              id={editorId}
              message={message}
              onSubmit={(update) => {
                // Ctrl+Enter can submit while the Save button is disabled.
                if (save.isPending) return
                save.mutate(update, { onSuccess: () => setEditing(false) })
              }}
            />
          ) : message.draftReply ? (
            <div className="flex flex-col gap-4">
              <p className="text-interface leading-relaxed whitespace-pre-wrap">
                {message.draftReply}
              </p>
              {message.filledForm && (
                <FilledFormView
                  form={message.filledForm}
                  showSources={showSources}
                  onShowSourcesChange={setShowSources}
                />
              )}
            </div>
          ) : (
            <p className="text-metadata text-muted-foreground">No draft yet.</p>
          )}
        </section>
      </div>

      {/* The card's bottom row, where the reference has Reply. On phones it stays on
          screen while you read a long email. */}
      <footer className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3.5 max-lg:sticky max-lg:bottom-0 max-lg:rounded-b-[20px] max-lg:bg-card sm:px-7">
        {(reply?.status === 'failed' || save.isError) && (
          <p role="alert" className="w-full text-metadata text-destructive">
            {save.isError ? "Couldn't save your changes." : "Couldn't send."} Please try again.
          </p>
        )}
        <span role="status" className="sr-only">
          {held && `Your reply sends in ${UNDO_SECONDS} seconds unless you undo it.`}
        </span>
        {approved ? (
          <p className="flex h-9 items-center gap-2 text-interface font-medium">
            <CircleCheck className="size-4 text-primary" aria-hidden /> Sent
          </p>
        ) : editing ? (
          <>
            <Button type="submit" form={editorId} disabled={save.isPending}>
              {save.isPending ? 'Saving…' : 'Save changes'}
            </Button>
            <Button
              variant="ghost"
              disabled={save.isPending}
              onClick={() => {
                save.reset()
                setEditing(false)
              }}
            >
              Cancel
            </Button>
          </>
        ) : busy ? (
          <>
            {/* Approve's place shows the countdown, so a double click can't undo.
                Focus moves to Undo from the button that was just disabled. */}
            <Button variant="approve" disabled>
              {held ? `Sends in ${seconds}s` : 'Sending…'}
            </Button>
            <Button
              key="undo"
              variant="secondary"
              autoFocus
              disabled={!held}
              onClick={() => undoSend(message.id)}
            >
              <Undo2 aria-hidden /> Undo
            </Button>
          </>
        ) : (
          <Button
            variant="approve"
            disabled={!message.draftReply}
            onClick={() => holdSend(message.id, message.from)}
          >
            <Send aria-hidden /> Approve & send
          </Button>
        )}
        <span className="ml-auto flex items-center gap-1">
          <a
            href={forwardLink(message)}
            title="Opens your email app with this email in it. Nothing is sent from here."
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'px-2.5')}
          >
            Forward
          </a>
          <CopyButton
            label="Get link"
            done="Link copied"
            text={() => `${window.location.origin}/inbox/${message.id}`}
          />
        </span>
      </footer>
    </article>
  )
}

/** The icon row at the top of the card, with the email's place in the list. */
function Toolbar({
  message,
  place,
  adjacent,
}: {
  message: Message
  place: ReturnType<typeof placeOf>
  adjacent: ReturnType<typeof useAdjacent>
}) {
  const [moved, setMoved] = useState('')
  const move = (to: typeof place) => {
    moveTo(message.id, to)
    setMoved(
      to === null
        ? 'Moved back to the inbox.'
        : `Moved to ${to === 'archived' ? 'Archive' : 'Deleted'} in this browser. Your mailbox isn't changed.`,
    )
  }
  return (
    <div className="border-b border-border px-3 py-2.5 sm:px-5">
      <div className="flex items-center gap-1">
        <Toggletip icon={Clock} label="When it arrived">
          Arrived {fullDate(message.receivedAt)}
        </Toggletip>
        <Link
          to="/inbox/$messageId"
          params={{ messageId: message.id }}
          search={(prev) => ({ ...prev, priority: message.priority })}
          aria-label={`Show only ${message.priority} priority`}
          title={`Show only ${message.priority} priority`}
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon' }),
            'size-9 rounded-full [&_svg]:size-4',
          )}
        >
          <Tag aria-hidden />
        </Link>
        {place === 'deleted' ? (
          <IconButton icon={Undo2} label="Move back to the inbox" onClick={() => move(null)} />
        ) : (
          <IconButton icon={Trash2} label="Delete" onClick={() => move('deleted')} />
        )}
        {place === 'archived' ? (
          <IconButton
            icon={ArchiveRestore}
            label="Move back to the inbox"
            onClick={() => move(null)}
          />
        ) : (
          <IconButton icon={Archive} label="Archive" onClick={() => move('archived')} />
        )}
        <span className="ml-auto flex items-center gap-1">
          {adjacent.position !== null && (
            <span className="mr-1 text-metadata text-muted-foreground tabular-nums">
              {adjacent.position} of {adjacent.total}
            </span>
          )}
          <AdjacentLink to={adjacent.previous} label="Previous email" icon={ChevronLeft} />
          <AdjacentLink to={adjacent.next} label="Next email" icon={ChevronRight} />
        </span>
      </div>
      <p role="status" className="text-metadata text-muted-foreground empty:hidden">
        {moved}
      </p>
    </div>
  )
}

function AdjacentLink({
  to,
  label,
  icon: Icon,
}: {
  to: { id: string } | undefined
  label: string
  icon: LucideIcon
}) {
  const className = cn(
    buttonVariants({ variant: 'ghost', size: 'icon' }),
    'size-8 rounded-full [&_svg]:size-4',
  )
  if (!to) {
    return (
      <button type="button" aria-label={label} disabled className={className}>
        <Icon aria-hidden />
      </button>
    )
  }
  return (
    <Link
      to="/inbox/$messageId"
      params={{ messageId: to.id }}
      search
      aria-label={label}
      title={label}
      className={className}
    >
      <Icon aria-hidden />
    </Link>
  )
}

function IconButton({
  icon: Icon,
  label,
  pressed,
  disabled,
  onClick,
  iconClassName,
}: {
  icon: LucideIcon
  label: string
  pressed?: boolean
  disabled?: boolean
  onClick: () => void
  iconClassName?: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        buttonVariants({ variant: 'ghost', size: 'icon' }),
        'size-9 rounded-full [&_svg]:size-4',
      )}
    >
      <Icon aria-hidden className={iconClassName} />
    </button>
  )
}

/** An icon that shows a line of detail under it when clicked, and reads it out. */
function Toggletip({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon
  label: string
  children: ReactNode
}) {
  const tip = useDisclosure()
  const { buttonRef, panelRef } = tip
  return (
    <div className="relative" onBlur={tip.onBlur}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-expanded={tip.open}
        title={label}
        onClick={tip.toggle}
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'size-9 rounded-full [&_svg]:size-4',
          tip.open && 'bg-muted text-foreground',
        )}
      >
        <Icon aria-hidden />
      </button>
      <div role="status">
        {tip.open && (
          <div
            ref={panelRef}
            className="absolute top-full left-0 z-30 mt-2 w-64 rounded-xl border border-card-edge bg-card p-3 text-metadata shadow-[0_12px_40px_-12px_rgb(0_0_0/0.35)]"
          >
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

function MoreMenu({ message }: { message: Message }) {
  const menu = useDisclosure()
  const { buttonRef, panelRef } = menu
  const menuId = useId()
  return (
    <div className="relative" onBlur={menu.onBlur}>
      <button
        ref={buttonRef}
        type="button"
        aria-label="More"
        aria-expanded={menu.open}
        aria-controls={menuId}
        title="More"
        onClick={menu.toggle}
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'size-9 rounded-full [&_svg]:size-4',
        )}
      >
        <Ellipsis aria-hidden />
      </button>
      <div
        ref={panelRef}
        id={menuId}
        hidden={!menu.open}
        className="absolute top-full right-0 z-30 mt-2 flex w-56 flex-col rounded-xl border border-card-edge bg-card p-1.5 shadow-[0_12px_40px_-12px_rgb(0_0_0/0.35)]"
      >
        <CopyButton
          label="Copy sender's address"
          done="Address copied"
          text={() => senderAddress(message.from)}
          row
        />
        <button
          type="button"
          onClick={() => {
            menu.setOpen(false)
            window.print()
          }}
          className="flex h-10 items-center rounded-lg px-3 text-left text-metadata font-medium hover:bg-muted"
        >
          Print
        </button>
      </div>
    </div>
  )
}

/** Copies text, then says so (or that it couldn't) beside the button. */
function CopyButton({
  label,
  done,
  text,
  row = false,
}: {
  label: string
  done: string
  text: () => string
  row?: boolean
}) {
  const [result, setResult] = useState('')
  useEffect(() => {
    if (!result) return
    const timer = setTimeout(() => setResult(''), 3000)
    return () => clearTimeout(timer)
  }, [result])
  return (
    <>
      <button
        type="button"
        onClick={() => {
          const copy = navigator.clipboard?.writeText(text())
          if (!copy) return setResult("Couldn't copy")
          copy.then(
            () => setResult(done),
            () => setResult("Couldn't copy"),
          )
        }}
        className={
          row
            ? 'flex h-10 items-center rounded-lg px-3 text-left text-metadata font-medium hover:bg-muted'
            : cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'px-2.5')
        }
      >
        {label}
      </button>
      <span
        role="status"
        className={cn('text-label text-muted-foreground empty:hidden', row && 'px-3 pb-1')}
      >
        {result}
      </span>
    </>
  )
}

/** A mailto link that opens the user's email app with this email quoted in a new message. */
function forwardLink(message: Message) {
  const body = [
    '---------- Forwarded message ----------',
    `From: ${message.from}`,
    `Date: ${fullDate(message.receivedAt)}`,
    `Subject: ${message.subject}`,
    '',
    message.body,
  ].join('\n')
  return `mailto:?subject=${encodeURIComponent(`Fwd: ${message.subject}`)}&body=${encodeURIComponent(body)}`
}

declare module '@tanstack/react-router' {
  interface HistoryState {
    /** Set by New email, so the open email's draft opens for editing. */
    editDraft?: number
  }
}
