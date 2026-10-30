import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { DraftReview, messageQuery, PriorityBadge } from '@/features/inbox'
import { isApiError } from '@/lib/api-client'

export const Route = createFileRoute('/_app/inbox/$messageId')({
  loader: async ({ context, params }) => {
    try {
      await context.queryClient.ensureQueryData(messageQuery(params.messageId))
    } catch (error) {
      if (isApiError(error, 404)) throw notFound()
      throw error
    }
  },
  component: MessagePage,
})

function MessagePage() {
  const { messageId } = Route.useParams()
  const { data: message } = useSuspenseQuery(messageQuery(messageId))

  return (
    <div className="max-w-3xl">
      <Link
        to="/inbox"
        // Back to the list as it was: same filter and search.
        search
        // Exact, so the back link isn't announced as the current page.
        activeOptions={{ exact: true }}
        className="mb-6 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> Inbox
      </Link>
      <PageHeader
        title={message.subject}
        description={`From ${message.from}${message.account ? ` to ${message.account.email}` : ''}`}
        actions={<PriorityBadge priority={message.priority} />}
      />
      {/* Keyed so edit and error state never carry over from another message. */}
      <DraftReview key={message.id} message={message} />
    </div>
  )
}
