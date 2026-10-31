import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { connectionsQuery } from '@/features/connections'
import { messagesQuery } from '../api/queries'
import { searchMessages } from '../lib/search'
import { sortByPriority } from '../lib/sort'
import type { Message, Priority } from '../types'

/**
 * Opens the email after (1) or before (-1) this one, in the order the inbox lists
 * them with the same filter and search, so j and k on an email walk the list you
 * came from. At either end it stays put.
 */
export function useOpenAdjacent(message: Message) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const search: { priority?: Priority; q?: string; account?: string } = useSearch({
    strict: false,
  })

  return async (by: 1 | -1) => {
    const [all, connections] = await Promise.all([
      queryClient.ensureQueryData(messagesQuery({ priority: search.priority })),
      queryClient.ensureQueryData(connectionsQuery()),
    ])
    // As in the inbox, an account that isn't connected (an old link, say) shows every
    // account. A filter for some other account than this email's can't be the list
    // you came from, so that walks every account too.
    const account =
      connections.some((c) => c.id === search.account) && message.account?.id === search.account
        ? search.account
        : undefined
    const inList = account ? all.filter((m) => m.account?.id === account) : all
    const listed = searchMessages(sortByPriority(inList), search.q)
    const at = listed.findIndex((m) => m.id === message.id)
    const next = at === -1 ? undefined : listed[at + by]
    if (!next) return
    await navigate({ to: '/inbox/$messageId', params: { messageId: next.id }, search: true })
  }
}
