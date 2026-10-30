import type { MessageSummary } from '../types'
import { sortByPriority } from './sort'

const msg = (id: string, priority: MessageSummary['priority'], receivedAt: string) =>
  ({
    id,
    priority,
    receivedAt,
    from: '',
    subject: '',
    preview: '',
    summary: null,
    priorityReason: null,
    approvedAt: null,
  }) satisfies MessageSummary

describe('sortByPriority', () => {
  it('orders by priority, then newest first', () => {
    const sorted = sortByPriority([
      msg('a', 'low', '2026-10-25T10:00:00Z'),
      msg('b', 'high', '2026-10-24T10:00:00Z'),
      msg('c', 'high', '2026-10-25T10:00:00Z'),
      msg('d', 'medium', '2026-10-25T09:00:00Z'),
    ])
    expect(sorted.map((m) => m.id)).toEqual(['c', 'b', 'd', 'a'])
  })

  it('compares times, not strings, so mixed timestamp formats sort correctly', () => {
    const sorted = sortByPriority([
      msg('older', 'high', '2026-10-25T10:00:00Z'),
      msg('newer-ms', 'high', '2026-10-25T10:00:00.500Z'),
      // 08:30 at UTC-3 is 11:30Z, the newest, though it sorts first as a string.
      msg('newest-offset', 'high', '2026-10-25T08:30:00-03:00'),
    ])
    expect(sorted.map((m) => m.id)).toEqual(['newest-offset', 'newer-ms', 'older'])
  })

  it('does not mutate its input', () => {
    const input = [
      msg('a', 'low', '2026-10-25T10:00:00Z'),
      msg('b', 'high', '2026-10-25T11:00:00Z'),
    ]
    sortByPriority(input)
    expect(input.map((m) => m.id)).toEqual(['a', 'b'])
  })
})
