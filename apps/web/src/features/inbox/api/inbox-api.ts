import { ApiError, apiFetch } from '@/lib/api-client'
import { mocksEnabled } from '@/lib/demo-mode'
import { mockDelay } from '@/lib/mock'
import type { DraftUpdate, Message, MessageFilters, MessageSummary, WeeklyStats } from '../types'

// Transport only: HTTP calls, or the in-memory mocks in development and in the
// demo. Mocks are imported lazily so a signed-in production session never loads them.

export async function getMessages(filters: MessageFilters): Promise<MessageSummary[]> {
  if (mocksEnabled()) {
    const { mockMessages } = await import('./mocks')
    await mockDelay()
    return structuredClone(
      mockMessages.filter((m) => !filters.priority || m.priority === filters.priority),
    )
  }
  const query = new URLSearchParams(filters.priority ? { priority: filters.priority } : {})
  return apiFetch<MessageSummary[]>(`/messages?${query}`)
}

export async function getMessage(id: string): Promise<Message> {
  if (mocksEnabled()) {
    const { mockMessages } = await import('./mocks')
    await mockDelay()
    const message = mockMessages.find((m) => m.id === id)
    if (!message) throw new ApiError(404, `Message ${id} not found`)
    return structuredClone(message)
  }
  return apiFetch<Message>(`/messages/${encodeURIComponent(id)}`)
}

export async function saveDraft(id: string, update: DraftUpdate): Promise<Message> {
  if (mocksEnabled()) {
    const { mockMessages } = await import('./mocks')
    await mockDelay()
    const message = mockMessages.find((m) => m.id === id)
    if (!message) throw new ApiError(404, `Message ${id} not found`)
    if (message.approvedAt) throw new ApiError(409, 'This draft was already approved')
    message.draftReply = update.draftReply
    for (const field of message.filledForm?.fields ?? []) {
      const value = update.formValues?.[field.id] ?? field.value
      // A value the user changed no longer comes from the email.
      if (value !== field.value) field.source = null
      field.value = value
    }
    return structuredClone(message)
  }
  return apiFetch<Message>(`/messages/${encodeURIComponent(id)}/draft`, {
    method: 'PATCH',
    body: JSON.stringify(update),
  })
}

export async function approveDraft(id: string): Promise<void> {
  if (mocksEnabled()) {
    const { mockMessages } = await import('./mocks')
    await mockDelay()
    const message = mockMessages.find((m) => m.id === id)
    if (!message) throw new ApiError(404, `Message ${id} not found`)
    message.approvedAt = new Date().toISOString()
    return
  }
  return apiFetch<void>(`/messages/${encodeURIComponent(id)}/approve`, { method: 'POST' })
}

export async function getWeeklyStats(): Promise<WeeklyStats> {
  if (mocksEnabled()) {
    const { mockMessages } = await import('./mocks')
    await mockDelay()
    const since = Date.now() - 7 * 24 * 60 * 60_000
    const approved = mockMessages.filter((m) => m.approvedAt && Date.parse(m.approvedAt) >= since)
    return {
      draftsApproved: approved.length,
      formsApproved: approved.filter((m) => m.filledForm).length,
    }
  }
  return apiFetch<WeeklyStats>('/stats/week')
}

/** Puts the sample inbox back to how it started, so each demo begins fresh. */
export async function resetSampleInbox(): Promise<void> {
  const { resetMockMessages } = await import('./mocks')
  resetMockMessages()
}
