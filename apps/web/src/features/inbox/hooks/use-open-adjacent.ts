import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
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
    const all = sortByPriority(
      await queryClient.ensureQueryData(messagesQuery({ priority: search.priority })),
    )
    // The list shows one account's mail only when that filter is on, as it is for this email.
    const sameAccount =
      search.account && message.account?.id === search.account
        ? all.filter((m) => m.account?.id === search.account)
        : all
    const listed = searchMessages(sameAccount, search.q)
    const at = listed.findIndex((m) => m.id === message.id)
    const next = at === -1 ? undefined : listed[at + by]
    if (!next) return
    await navigate({ to: '/inbox/$messageId', params: { messageId: next.id }, search: true })
  }
}
