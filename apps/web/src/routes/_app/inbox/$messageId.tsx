import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, notFound } from '@tanstack/react-router'
import { NotFound } from '@/components/feedback/not-found'
import { messageQuery, ReadingPane } from '@/features/inbox'
import { isApiError } from '@/lib/api-client'

// The open email, in the reading card beside the list (see ./route.tsx).
export const Route = createFileRoute('/_app/inbox/$messageId')({
  loader: async ({ context, params }) => {
    try {
      await context.queryClient.ensureQueryData(messageQuery(params.messageId))
    } catch (error) {
      if (isApiError(error, 404)) throw notFound()
      throw error
    }
  },
  // In the reading card, so the list stays beside it.
  notFoundComponent: NotFound,
  component: MessagePage,
})

function MessagePage() {
  const { messageId } = Route.useParams()
  const { data: message } = useSuspenseQuery(messageQuery(messageId))
  // Keyed so edit and error state never carry over from another message.
  return <ReadingPane key={message.id} message={message} />
}
