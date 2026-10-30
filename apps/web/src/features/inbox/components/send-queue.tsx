import { useIsMutating } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'
import { CircleAlert, CircleCheck, Clock, LoaderCircle } from 'lucide-react'
import { type ReactNode, useEffect, useRef } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { signOutKey } from '@/features/auth'
import { useApproveDraft } from '../hooks/use-approve-draft'
import {
  connectSender,
  dismissReply,
  dropHeldReplies,
  type OutgoingReply,
  UNDO_SECONDS,
  undoSend,
  useOutgoingReplies,
  useSecondsLeft,
} from '../lib/outgoing-replies'

/**
 * Sends approved replies once their undo window ends, and shows the ones held,
 * sending, sent or failed. It lives in the app layout so a reply keeps its window
 * while the user moves on. The open message shows its own reply on its page instead.
 */
export function SendQueue() {
  const { mutateAsync } = useApproveDraft()
  const latest = useRef(mutateAsync)
  useEffect(() => {
    latest.current = mutateAsync
  })
  // Replies only reach this after a click on Approve & send and the undo window.
  useEffect(() => connectSender((messageId) => latest.current(messageId)), [])

  // Signing out drops held replies as soon as it starts, not when the page finally
  // changes, so a slow sign-out can't let one send.
  const signingOut = useIsMutating({ mutationKey: signOutKey }) > 0
  useEffect(() => {
    if (signingOut) dropHeldReplies()
  }, [signingOut])

  const replies = useOutgoingReplies()
  // Demo replies are samples, so leaving the demo needn't ask.
  const anyHeld = replies.some((r) => r.status === 'held' && !r.demo)
  useEffect(() => {
    if (!anyHeld) return
    // Closing the tab drops a held reply, so the browser asks first.
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [anyHeld])

  const openId = useParams({ strict: false }).messageId
  return (
    // Phones show these at the top, clear of the draft page's approve bar.
    <div
      role="status"
      className="pointer-events-none fixed inset-x-4 top-4 z-50 flex flex-col gap-2 md:inset-x-auto md:top-auto md:right-6 md:bottom-6 md:w-96"
    >
      {replies
        .filter((reply) => reply.messageId !== openId)
        .map((reply) => (
          <ReplyToast key={reply.messageId} reply={reply} />
        ))}
    </div>
  )
}

function ReplyToast({ reply }: { reply: OutgoingReply }) {
  const seconds = useSecondsLeft(reply)
  const to = <span className="font-medium [overflow-wrap:anywhere]">{reply.to}</span>

  switch (reply.status) {
    case 'held':
      return (
        <Toast icon={<Clock className="text-primary" aria-hidden />}>
          <p className="min-w-0 flex-1">
            Reply to {to} sends in {/* Read out once, not every second. */}
            <span className="tabular-nums" aria-hidden>
              {seconds}s
            </span>
            <span className="sr-only">{UNDO_SECONDS} seconds</span>
          </p>
          <Button size="sm" variant="secondary" onClick={() => undoSend(reply.messageId)}>
            Undo
          </Button>
        </Toast>
      )
    case 'sending':
      return (
        <Toast icon={<LoaderCircle className="animate-spin text-muted-foreground" aria-hidden />}>
          <p className="min-w-0 flex-1">Sending the reply to {to}…</p>
        </Toast>
      )
    case 'sent':
      return (
        <Toast icon={<CircleCheck className="text-primary" aria-hidden />}>
          <p className="min-w-0 flex-1">Reply sent to {to}</p>
        </Toast>
      )
    case 'failed':
      return (
        <Toast icon={<CircleAlert className="text-destructive" aria-hidden />}>
          <p className="min-w-0 flex-1">
            {"Couldn't send the reply to "}
            {to}
          </p>
          <Link
            to="/inbox/$messageId"
            params={{ messageId: reply.messageId }}
            className={buttonVariants({ size: 'sm', variant: 'secondary' })}
          >
            Open
          </Link>
          <Button size="sm" variant="ghost" onClick={() => dismissReply(reply.messageId)}>
            Dismiss
          </Button>
        </Toast>
      )
  }
}

function Toast({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="pointer-events-auto flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-interface shadow-panel [&>svg]:size-4 [&>svg]:shrink-0">
      {icon}
      {children}
    </div>
  )
}
