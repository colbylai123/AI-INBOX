import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { DemoWelcome } from '@/components/layout/demo-welcome'
import { PageHeader } from '@/components/layout/page-header'
import { useDemoMode } from '@/lib/demo-mode'
import {
  AccountFilter,
  ConnectPrompt,
  connectionsQuery,
  ReconnectAlert,
} from '@/features/connections'
import {
  MessageList,
  messagesQuery,
  PriorityFilter,
  SearchBox,
  searchMessages,
  WeeklySummary,
  weeklyStatsQuery,
  type MessageSummary,
} from '@/features/inbox'
import { materialsQuery } from '@/features/materials'
import { GettingStarted } from '@/features/onboarding'

export const Route = createFileRoute('/_app/inbox/')({
  // ?priority, ?q and ?account are declared on the parent route (./route.tsx).
  loaderDeps: ({ search }) => ({ priority: search.priority }),
  loader: ({ context, deps }) => {
    // Only for the checklist and the stats card, so they're fetched alongside but never hold up the inbox.
    void context.queryClient.prefetchQuery(materialsQuery())
    void context.queryClient.prefetchQuery(weeklyStatsQuery())
    return Promise.all([
      context.queryClient.ensureQueryData(messagesQuery(deps)),
      context.queryClient.ensureQueryData(connectionsQuery()),
    ])
  },
  component: InboxPage,
})

function InboxPage() {
  const demo = useDemoMode()
  const filters = Route.useLoaderDeps()
  const search = Route.useSearch()
  const { q } = search
  const navigate = Route.useNavigate()
  const { data: allMessages } = useSuspenseQuery(messagesQuery(filters))
  const { data: connections } = useSuspenseQuery(connectionsQuery())
  // An account that isn't connected (an old link, say) shows every account.
  const account = connections.some((c) => c.id === search.account) ? search.account : undefined
  const messages = account ? allMessages.filter((m) => m.account?.id === account) : allMessages
  const manyAccounts = connections.length > 1
  // Not suspense: if these fail to load, the inbox still shows, just without the checklist or stats.
  const materials = useQuery(materialsQuery())
  const stats = useQuery(weeklyStatsQuery())
  return (
    <>
      <PageHeader
        title="Inbox"
        description={
          demo
            ? 'Three sample messages, most important first.'
            : 'Incoming messages, most important first.'
        }
      />
      {demo && <DemoWelcome />}
      {connections.length === 0 ? (
        <ConnectPrompt />
      ) : (
        <>
          <ReconnectAlert connections={connections} />
          {stats.isSuccess && <WeeklySummary stats={stats.data} />}
          {/* Only on the unfiltered list, where "approved any yet?" sees every message. */}
          {!filters.priority && !q && !account && materials.isSuccess && (
            <GettingStarted
              connected={connections.some((c) => c.status === 'connected')}
              hasMaterials={materials.data.length > 0}
              hasApproved={messages.some((m) => m.approvedAt)}
              nextDraftId={messages.find((m) => m.hasDraft && !m.approvedAt)?.id}
            />
          )}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-3">
              <PriorityFilter value={filters.priority} />
              {manyAccounts && (
                <AccountFilter
                  connections={connections}
                  value={account}
                  onChange={(next) =>
                    void navigate({ search: (prev) => ({ ...prev, account: next }) })
                  }
                />
              )}
            </div>
            <SearchBox
              query={q}
              onQueryChange={(next) =>
                void navigate({ search: (prev) => ({ ...prev, q: next }), replace: true })
              }
            />
          </div>
          <SearchResults
            messages={messages}
            query={q}
            showAccount={manyAccounts && !account}
            filtered={Boolean(filters.priority || account)}
          />
          <p className="mt-4 text-metadata text-muted-foreground max-md:hidden">
            Press <kbd className="rounded-sm border border-border bg-muted px-1.5">?</kbd> for
            keyboard shortcuts.
          </p>
        </>
      )}
    </>
  )
}

function SearchResults({
  messages,
  query,
  showAccount,
  filtered,
}: {
  messages: MessageSummary[]
  query: string | undefined
  showAccount: boolean
  filtered: boolean
}) {
  const found = searchMessages(messages, query)
  return (
    <>
      {/* Says how many matched as the user types. Empty when not searching. */}
      <p
        role="status"
        className={found === messages ? 'sr-only' : 'mb-3 text-metadata text-muted-foreground'}
      >
        {found !== messages && `${found.length} of ${messages.length} messages match`}
      </p>
      {found.length === 0 && messages.length > 0 ? (
        <p className="text-sm text-muted-foreground">No messages match “{query?.trim()}”.</p>
      ) : (
        <MessageList messages={found} showAccount={showAccount} filtered={filtered} />
      )}
    </>
  )
}
