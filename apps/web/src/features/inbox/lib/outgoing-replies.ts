import { useEffect, useState, useSyncExternalStore } from 'react'
import { isDemoMode } from '@/lib/demo-mode'

// Approve & send holds a reply this long before sending it, so it can be taken back.
export const UNDO_SECONDS = 10
// How long "Reply sent" stays up.
const SENT_NOTICE_MS = 4000

export type OutgoingReply = {
  messageId: string
  to: string
  sendAt: number
  status: 'held' | 'sending' | 'sent' | 'failed'
  /** Approved in the demo, on sample mail. It may only ever reach the mocks. */
  demo: boolean
}

let replies: readonly OutgoingReply[] = []
const timers = new Map<string, ReturnType<typeof setTimeout>>()
const listeners = new Set<() => void>()
let send: ((messageId: string) => Promise<unknown>) | null = null

function set(messageId: string, reply: OutgoingReply | null) {
  const others = replies.filter((r) => r.messageId !== messageId)
  replies = reply ? [...others, reply] : others
  for (const listener of listeners) listener()
}

function later(messageId: string, ms: number, run: () => void) {
  clearTimeout(timers.get(messageId))
  timers.set(
    messageId,
    setTimeout(() => {
      timers.delete(messageId)
      run()
    }, ms),
  )
}

/** Starts the undo window for a reply the user just approved. It sends when the window ends. */
export function holdSend(messageId: string, to: string) {
  const current = replies.find((r) => r.messageId === messageId)
  if (current?.status === 'held' || current?.status === 'sending') return
  const held: OutgoingReply = {
    messageId,
    to,
    sendAt: Date.now() + UNDO_SECONDS * 1000,
    status: 'held',
    demo: isDemoMode(),
  }
  set(messageId, held)
  later(messageId, UNDO_SECONDS * 1000, () => {
    // Dropped if the demo started or ended meanwhile, so a sample reply never reaches
    // the real API and a real one never goes to the mocks.
    if (!send || held.demo !== isDemoMode()) return set(messageId, null)
    const sending = { ...held, status: 'sending' as const }
    set(messageId, sending)
    // A reply dropped meanwhile (the user left the app) stays dropped.
    const settle = (status: 'sent' | 'failed') => {
      if (replies.find((r) => r.messageId === messageId) !== sending) return
      set(messageId, { ...held, status })
      if (status === 'sent') later(messageId, SENT_NOTICE_MS, () => set(messageId, null))
    }
    send(messageId).then(
      () => settle('sent'),
      () => settle('failed'),
    )
  })
}

/** Takes back a held reply. Nothing is sent. */
export function undoSend(messageId: string) {
  if (replies.find((r) => r.messageId === messageId)?.status !== 'held') return
  clearTimeout(timers.get(messageId))
  timers.delete(messageId)
  set(messageId, null)
}

/** Takes back every held reply, as when the user signs out. Replies already sending go on. */
export function dropHeldReplies() {
  for (const reply of replies) undoSend(reply.messageId)
}

/** Clears a "sent" or "couldn't send" notice. */
export function dismissReply(messageId: string) {
  const status = replies.find((r) => r.messageId === messageId)?.status
  if (status === 'sent' || status === 'failed') {
    clearTimeout(timers.get(messageId))
    set(messageId, null)
  }
}

/**
 * Connects replies to the request that sends them. The returned cleanup drops
 * everything, so leaving the app (signing out, ending a demo) never lets a held
 * reply go out later.
 */
export function connectSender(fn: (messageId: string) => Promise<unknown>) {
  send = fn
  return () => {
    send = null
    for (const timer of timers.values()) clearTimeout(timer)
    timers.clear()
    replies = []
    for (const listener of listeners) listener()
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useOutgoingReplies() {
  return useSyncExternalStore(subscribe, () => replies)
}

export function useOutgoingReply(messageId: string) {
  return useOutgoingReplies().find((r) => r.messageId === messageId)
}

/** Whole seconds until a held reply sends, ticking while it's held. */
export function useSecondsLeft(reply: OutgoingReply | undefined) {
  const sendAt = reply?.status === 'held' ? reply.sendAt : undefined
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    if (sendAt === undefined) return
    const timer = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(timer)
  }, [sendAt])
  if (sendAt === undefined) return 0
  // `now` can be from before this reply was held, until the first tick.
  return Math.min(UNDO_SECONDS, Math.max(1, Math.ceil((sendAt - now) / 1000)))
}
