import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { PageHeader } from '@/components/layout/page-header'
import { ConnectPrompt, connectionsQuery, ReconnectAlert } from '@/features/connections'
import { MessageList, messagesQuery, PriorityFilter, priorities } from '@/features/inbox'
import { materialsQuery } from '@/features/materials'
import { GettingStarted } from '@/features/onboarding'

export const Route = createFileRoute('/_app/inbox/')({
  // Typed, validated URL state. Unknown values fall back to "all".
  validateSearch: z.object({
    priority: z.enum(priorities).optional().catch(undefined),
  }),
  loaderDeps: ({ search }) => ({ priority: search.priority }),
  loader: ({ context, deps }) => {
    // Only for the checklist, so it's fetched alongside but never holds up the inbox.
    void context.queryClient.prefetchQuery(materialsQuery())
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
  // Not suspense: if materials fail to load, the inbox still shows, just without the checklist.
  const materials = useQuery(materialsQuery())
  return (
    <>
      <PageHeader title="Inbox" description="Incoming messages, most important first." />
      {connections.length === 0 ? (
        <ConnectPrompt />
      ) : (
        <>
          <ReconnectAlert connections={connections} />
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
        </>
      )}
    </>
  )
}
