import type { MessageSummary, Priority } from '../types'

const rank: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

/** Most important first, then newest first. Returns a new array. */
export function sortByPriority<T extends MessageSummary>(messages: T[]): T[] {
  return messages.toSorted(
    (a, b) => rank[a.priority] - rank[b.priority] || b.receivedAt.localeCompare(a.receivedAt),
  )
}
