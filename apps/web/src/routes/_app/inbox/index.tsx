import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { PageHeader } from '@/components/layout/page-header'
import { ConnectPrompt, connectionsQuery, ReconnectAlert } from '@/features/connections'
import { MessageList, messagesQuery, PriorityFilter, priorities } from '@/features/inbox'

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
    ]),
  component: InboxPage,
})

function InboxPage() {
  const filters = Route.useLoaderDeps()
  const { data: messages } = useSuspenseQuery(messagesQuery(filters))
  const { data: connections } = useSuspenseQuery(connectionsQuery())
  return (
    <>
      <PageHeader title="Inbox" description="Incoming messages, most important first." />
      {connections.length === 0 ? (
        <ConnectPrompt />
      ) : (
        <>
          <ReconnectAlert connections={connections} />
          <PriorityFilter value={filters.priority} />
          <MessageList messages={messages} />
        </>
      )}
    </>
  )
}
