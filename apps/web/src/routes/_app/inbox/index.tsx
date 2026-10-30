import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
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
    priority: z.enum(priorities).optional().catch(undefined),
  }),
  loaderDeps: ({ search }) => ({ priority: search.priority }),
  loader: ({ context, deps }) =>
    Promise.all([
      context.queryClient.ensureQueryData(messagesQuery(deps)),
      context.queryClient.ensureQueryData(connectionsQuery()),
      context.queryClient.ensureQueryData(materialsQuery()),
      context.queryClient.ensureQueryData(weeklyStatsQuery()),
    ]),
  component: InboxPage,
})

function InboxPage() {
  const filters = Route.useLoaderDeps()
  const { data: messages } = useSuspenseQuery(messagesQuery(filters))
  const { data: connections } = useSuspenseQuery(connectionsQuery())
  const { data: materials } = useSuspenseQuery(materialsQuery())
  const { data: stats } = useSuspenseQuery(weeklyStatsQuery())
  return (
    <>
      <PageHeader title="Inbox" description="Incoming messages, most important first." />
      {connections.length === 0 ? (
        <ConnectPrompt />
      ) : (
        <>
          <ReconnectAlert connections={connections} />
          <WeeklySummary stats={stats} />
          {/* Only on the unfiltered list, where "approved any yet?" sees every message. */}
          {!filters.priority && (
            <GettingStarted
              connected={connections.some((c) => c.status === 'connected')}
              hasMaterials={materials.length > 0}
              hasApproved={messages.some((m) => m.approvedAt)}
              topMessageId={messages[0]?.id}
            />
          )}
          <PriorityFilter value={filters.priority} />
          <MessageList messages={messages} />
        </>
      )}
    </>
  )
}
