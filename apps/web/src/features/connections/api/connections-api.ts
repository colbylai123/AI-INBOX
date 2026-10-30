import { ApiError, apiFetch } from '@/lib/api-client'
import { mocksEnabled } from '@/lib/demo-mode'
import { env } from '@/lib/env'
import { mockDelay } from '@/lib/mock'
import type { Connection } from '../types'

// Transport only: HTTP calls, or the in-memory mocks in development and in the demo.

export async function getConnections(): Promise<Connection[]> {
  if (mocksEnabled()) {
    const { mockConnections } = await import('./mocks')
    await mockDelay()
    // Pretend the sync ran a couple of minutes ago, so the demo never looks stale.
    const syncedAt = new Date(Date.now() - 2 * 60_000).toISOString()
    return mockConnections.map((c) => ({ ...c, lastSyncedAt: syncedAt }))
  }
  return apiFetch<Connection[]>('/connections')
}

/**
 * Sends the browser to Microsoft (a full page load, like sign-in), which comes
 * back to Settings with ?connection=connected|failed. The mocks connect at once.
 */
export async function connectOutlook(): Promise<void> {
  if (mocksEnabled()) {
    const { connectMockOutlook } = await import('./mocks')
    await mockDelay()
    connectMockOutlook()
    return
  }
  window.location.assign(
    `${env.VITE_API_URL}/connections/outlook/start?return_to=${encodeURIComponent('/settings')}`,
  )
  // The page is unloading. Never settle, so the button stays busy until it's gone.
  return new Promise(() => {})
}

export async function disconnect(id: string): Promise<void> {
  if (mocksEnabled()) {
    const mocks = await import('./mocks')
    await mockDelay()
    const index = mocks.mockConnections.findIndex((c) => c.id === id)
    if (index === -1) throw new ApiError(404, `Connection ${id} not found`)
    mocks.mockConnections.splice(index, 1)
    return
  }
  return apiFetch<void>(`/connections/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

/** Puts the sample connection back, so each demo begins connected. */
export async function resetSampleConnections(): Promise<void> {
  const { resetMockConnections } = await import('./mocks')
  resetMockConnections()
}
