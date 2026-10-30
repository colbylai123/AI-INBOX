import { queryOptions } from '@tanstack/react-query'
import { sortByPriority } from '../lib/sort'
import type { MessageFilters } from '../types'
import { getMessage, getMessages, getWeeklyStats } from './inbox-api'

// Query keys live next to their queries so invalidation stays consistent.
export const inboxKeys = {
  all: ['inbox'] as const,
  lists: () => [...inboxKeys.all, 'list'] as const,
  list: (filters: MessageFilters) => [...inboxKeys.lists(), filters] as const,
  detail: (id: string) => [...inboxKeys.all, 'detail', id] as const,
  // Under inboxKeys.all, so approving a draft refreshes the numbers too.
  stats: () => [...inboxKeys.all, 'stats'] as const,
}

export const messagesQuery = (filters: MessageFilters = {}) =>
  queryOptions({
    queryKey: inboxKeys.list(filters),
    queryFn: () => getMessages(filters),
    // New mail shows up within a minute while the inbox is open (and when the tab
    // regains focus), without a reload. Paused while the tab is hidden.
    refetchInterval: 60_000,
    select: sortByPriority,
  })

export const messageQuery = (id: string) =>
  queryOptions({ queryKey: inboxKeys.detail(id), queryFn: () => getMessage(id) })

export const weeklyStatsQuery = () =>
  queryOptions({ queryKey: inboxKeys.stats(), queryFn: getWeeklyStats })
