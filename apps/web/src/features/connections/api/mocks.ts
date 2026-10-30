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
 * What the redirect back from the provider would leave behind. An account that
 * needs reconnecting is the one the user signs back into. Otherwise they picked
 * another account, which is added next to the ones already connected.
 */
export function connectMockAccount(provider: Provider) {
  const stale = mockConnections.find(
    (c) => c.provider === provider && c.status === 'reconnect_needed',
  )
  if (stale) {
    stale.status = 'connected'
    return
  }
  mockConnections.push({
    id: `con-${++created}`,
    provider,
    accountEmail: unusedAddress(provider),
    status: 'connected',
    connectedAt: new Date().toISOString(),
    lastSyncedAt: null,
  })
}

/** demo@example.com, then demo2@example.com, and so on. */
function unusedAddress(provider: Provider) {
  const [name, domain] = sampleAddress[provider].split('@')
  const taken = new Set(mockConnections.map((c) => c.accountEmail))
  for (let n = 1; ; n++) {
    const address = `${name}${n === 1 ? '' : n}@${domain}`
    if (!taken.has(address)) return address
  }
}
