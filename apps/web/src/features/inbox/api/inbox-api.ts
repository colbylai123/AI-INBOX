import { ApiError, apiFetch } from '@/lib/api-client'
import { env } from '@/lib/env'
import { mockDelay } from '@/lib/mock'
import type { Message, MessageFilters, MessageSummary } from '../types'

// Transport only: HTTP calls, or the in-memory mocks when VITE_USE_MOCKS=true.
// Mocks are imported lazily so they never load in a production session.

export async function getMessages(filters: MessageFilters): Promise<MessageSummary[]> {
  if (env.VITE_USE_MOCKS) {
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
  if (env.VITE_USE_MOCKS) {
    const { mockMessages } = await import('./mocks')
    await mockDelay()
    const message = mockMessages.find((m) => m.id === id)
    if (!message) throw new ApiError(404, `Message ${id} not found`)
    return structuredClone(message)
  }
  return apiFetch<Message>(`/messages/${encodeURIComponent(id)}`)
}

export async function approveDraft(id: string): Promise<void> {
  if (env.VITE_USE_MOCKS) {
    const { mockMessages } = await import('./mocks')
    await mockDelay()
    const message = mockMessages.find((m) => m.id === id)
    if (!message) throw new ApiError(404, `Message ${id} not found`)
    message.approvedAt = new Date().toISOString()
    return
  }
  return apiFetch<void>(`/messages/${encodeURIComponent(id)}/approve`, { method: 'POST' })
}
