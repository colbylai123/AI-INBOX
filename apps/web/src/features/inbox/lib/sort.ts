import type { MessageSummary, Priority } from '../types'

const rank: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

/** Most important first, then newest first. Returns a new array. */
export function sortByPriority<T extends MessageSummary>(messages: T[]): T[] {
  // Compare instants, not strings: the API may send offsets or fractional seconds.
  return messages.toSorted(
    (a, b) =>
      rank[a.priority] - rank[b.priority] || Date.parse(b.receivedAt) - Date.parse(a.receivedAt),
  )
}
