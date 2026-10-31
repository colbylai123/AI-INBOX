import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { connectionsQuery } from '@/features/connections'
import { messagesQuery } from '../api/queries'
import { type Folder, inFolder } from '../lib/folders'
import { useLocalFolders } from '../lib/local-folders'
import { searchMessages } from '../lib/search'
import type { Priority } from '../types'

export type InboxSearch = { priority?: Priority; q?: string; account?: string; folder?: Folder }

/**
 * The emails the list card shows, with its folder, filters and search. The list and
 * the open email both use it, so "3 of 8", j and k walk exactly the rows on screen.
 */
export function useInboxList() {
  const search: InboxSearch = useSearch({ strict: false })
  const { data: all } = useSuspenseQuery(messagesQuery({ priority: search.priority }))
  // Not suspense: the accounts only filter the list and flag a reconnect, so if they
  // fail to load the list and the open email still show, across every account.
  const accounts = useQuery(connectionsQuery())
  const connections = accounts.data ?? []
  const local = useLocalFolders()
  // An account that isn't connected (an old link, say) shows every account.
  const account = connections.some((c) => c.id === search.account) ? search.account : undefined
  const ofAccount = account ? all.filter((m) => m.account?.id === account) : all
  const inList = inFolder(ofAccount, search.folder, local)
  return {
    search,
    connections,
    /** False until the accounts load, and while they fail to. */
    connectionsKnown: accounts.isSuccess,
    account,
    /** Every email of the chosen account, before the folder and search. */
    ofAccount,
    /** The folder's emails before the search, to say "2 of 3 match". */
    inList,
    listed: searchMessages(inList, search.q),
    /** How many emails the Inbox chip holds, whichever folder is open. */
    inboxCount:
      search.folder === undefined ? inList.length : inFolder(ofAccount, undefined, local).length,
    local,
  }
}

/** Where an email sits in the list, and a way to open the one after (1) or before (-1) it. */
export function useAdjacent(messageId: string) {
  const { listed } = useInboxList()
  const navigate = useNavigate()
  const at = listed.findIndex((m) => m.id === messageId)
  const neighbor = (by: 1 | -1) => (at === -1 ? undefined : listed[at + by])
  return {
    position: at === -1 ? null : at + 1,
    total: listed.length,
    previous: neighbor(-1),
    next: neighbor(1),
    open: (by: 1 | -1) => {
      const target = neighbor(by)
      if (target) {
        void navigate({ to: '/inbox/$messageId', params: { messageId: target.id }, search: true })
      }
    },
  }
}
