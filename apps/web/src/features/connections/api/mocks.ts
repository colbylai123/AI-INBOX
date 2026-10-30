import type { Connection, Provider } from '../types'

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

const sampleAddress: Record<Provider, string> = {
  outlook: 'demo@example.com',
  gmail: 'demo@gmail.example',
}

/**
 * What the redirect back from the provider would leave behind. Like the real API,
 * connecting an account that's already there reconnects it instead of adding another.
 */
export function connectMockAccount(provider: Provider) {
  const existing = mockConnections.find((c) => c.provider === provider)
  if (existing) {
    existing.status = 'connected'
    return
  }
  mockConnections.push({
    id: `con-${++created}`,
    provider,
    accountEmail: sampleAddress[provider],
    status: 'connected',
    connectedAt: new Date().toISOString(),
    lastSyncedAt: null,
  })
}
