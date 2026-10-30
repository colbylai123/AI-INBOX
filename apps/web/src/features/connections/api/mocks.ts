import type { Connection } from '../types'

const seed: Connection[] = [
  {
    id: 'con-1',
    provider: 'outlook',
    accountEmail: 'demo@example.com',
    status: 'connected',
    connectedAt: '2026-10-20T16:00:00Z',
    lastSyncedAt: null,
  },
]

// In-memory "database" so connecting and disconnecting behave realistically.
export let mockConnections: Connection[] = structuredClone(seed)
let created = 1

export function resetMockConnections() {
  mockConnections = structuredClone(seed)
  created = 1
}

/** What the redirect back from Microsoft would leave behind: one connected Outlook. */
export function connectMockOutlook() {
  const existing = mockConnections.find((c) => c.provider === 'outlook')
  if (existing) {
    existing.status = 'connected'
    return
  }
  mockConnections.push({
    id: `con-${++created}`,
    provider: 'outlook',
    accountEmail: 'demo@example.com',
    status: 'connected',
    connectedAt: new Date().toISOString(),
    lastSyncedAt: null,
  })
}
