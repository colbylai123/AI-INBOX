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
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> Inbox
      </Link>
      <PageHeader
        title={message.subject}
        description={`From ${message.from}`}
        actions={<PriorityBadge priority={message.priority} />}
      />
      <p className="mb-6 text-sm whitespace-pre-wrap">{message.body}</p>
      <DraftReview message={message} />
    </div>
  )
}
