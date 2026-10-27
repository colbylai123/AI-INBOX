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

  it('does not mutate its input', () => {
    const input = [msg('a', 'low', '1'), msg('b', 'high', '2')]
    sortByPriority(input)
    expect(input.map((m) => m.id)).toEqual(['a', 'b'])
  })
})
