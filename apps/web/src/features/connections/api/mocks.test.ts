import { connectMockAccount, mockConnections, resetMockConnections } from './mocks'

beforeEach(() => {
  resetMockConnections()
})

describe('connectMockAccount', () => {
  it('reconnects the selected account when two from the same provider are stale', () => {
    mockConnections[0]!.status = 'reconnect_needed'
    mockConnections.push({
      id: 'con-9',
      provider: 'outlook',
      accountEmail: 'other@example.com',
      status: 'reconnect_needed',
      connectedAt: '2026-10-21T16:00:00Z',
      lastSyncedAt: null,
    })

    connectMockAccount('outlook', 'con-9')

    expect(mockConnections.find((c) => c.id === 'con-1')?.status).toBe('reconnect_needed')
    expect(mockConnections.find((c) => c.id === 'con-9')?.status).toBe('connected')
  })

  it('still adds another account when no row was selected', () => {
    connectMockAccount('outlook')
    expect(mockConnections.map((c) => c.accountEmail)).toContain('demo2@example.com')
    expect(mockConnections.find((c) => c.id === 'con-1')?.status).toBe('connected')
  })
})
