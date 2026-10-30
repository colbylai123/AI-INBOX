import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod/mini'
import { PageHeader } from '@/components/layout/page-header'
import { ConnectPrompt, connectionsQuery, ReconnectAlert } from '@/features/connections'
import {
  MessageList,
  messagesQuery,
  PriorityFilter,
  priorities,
  WeeklySummary,
  weeklyStatsQuery,
} from '@/features/inbox'
import { materialsQuery } from '@/features/materials'
import { GettingStarted } from '@/features/onboarding'

export const Route = createFileRoute('/_app/inbox/')({
  // Typed, validated URL state. Unknown values fall back to "all".
  validateSearch: z.object({
    priority: z.catch(z.optional(z.enum(priorities)), undefined),
  }),
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
          {!filters.priority && materials.isSuccess && (
            <GettingStarted
              connected={connections.some((c) => c.status === 'connected')}
              hasMaterials={materials.data.length > 0}
              hasApproved={messages.some((m) => m.approvedAt)}
              nextDraftId={messages.find((m) => m.hasDraft && !m.approvedAt)?.id}
            />
          )}
          <PriorityFilter value={filters.priority} />
          <MessageList messages={messages} />
          <p className="mt-4 text-metadata text-muted-foreground max-md:hidden">
            Press <kbd className="rounded-sm border border-border bg-muted px-1.5">?</kbd> for
            keyboard shortcuts.
          </p>
        </>
      )}
    </>
  )
}
