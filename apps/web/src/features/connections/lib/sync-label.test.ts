import type { Connection } from '../types'
import { syncLabel } from './sync-label'

const now = Date.parse('2026-10-30T18:00:00Z')
const at = (lastSyncedAt: string | null): Connection => ({
  id: 'con-1',
  provider: 'outlook',
  accountEmail: 'a@example.com',
  status: 'connected',
  connectedAt: '2026-10-20T16:00:00Z',
  lastSyncedAt,
})

describe('syncLabel', () => {
  it('says when the first sync is still running', () => {
    expect(syncLabel(at(null), now)).toBe('Waiting for the first sync')
  })

  it('reads like a person would say it', () => {
    expect(syncLabel(at('2026-10-30T17:59:45Z'), now)).toBe('Synced just now')
    expect(syncLabel(at('2026-10-30T17:58:00Z'), now)).toBe('Synced 2 minutes ago')
    expect(syncLabel(at('2026-10-30T15:00:00Z'), now)).toBe('Synced 3 hours ago')
    expect(syncLabel(at('2026-10-29T12:00:00Z'), now)).toBe('Synced yesterday')
  })
})
