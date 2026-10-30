import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header'
import { ConnectPrompt, connectionsQuery, ReconnectAlert } from '@/features/connections'
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
  // ?priority and ?q are declared on the parent route (./route.tsx).
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
  const filters = Route.useLoaderDeps()
  const { q } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data: messages } = useSuspenseQuery(messagesQuery(filters))
  const { data: connections } = useSuspenseQuery(connectionsQuery())
  // Not suspense: if these fail to load, the inbox still shows, just without the checklist or stats.
  const materials = useQuery(materialsQuery())
  const stats = useQuery(weeklyStatsQuery())
  return (
    <>
      <PageHeader title="Inbox" description="Incoming messages, most important first." />
      {connections.length === 0 ? (
        <ConnectPrompt />
      ) : (
        <>
          <ReconnectAlert connections={connections} />
          {stats.isSuccess && <WeeklySummary stats={stats.data} />}
          {/* Only on the unfiltered list, where "approved any yet?" sees every message. */}
          {!filters.priority && !q && materials.isSuccess && (
            <GettingStarted
              connected={connections.some((c) => c.status === 'connected')}
              hasMaterials={materials.data.length > 0}
              hasApproved={messages.some((m) => m.approvedAt)}
              nextDraftId={messages.find((m) => m.hasDraft && !m.approvedAt)?.id}
            />
          )}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <PriorityFilter value={filters.priority} />
            <SearchBox
              query={q}
              onQueryChange={(next) =>
                void navigate({ search: (prev) => ({ ...prev, q: next }), replace: true })
              }
            />
          </div>
          <SearchResults messages={messages} query={q} />
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
}: {
  messages: MessageSummary[]
  query: string | undefined
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
        <MessageList messages={found} />
      )}
    </>
  )
}
