import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useApproveDraft } from '../hooks/use-approve-draft'
import type { Message } from '../types'
import { ChatBubble } from './chat-bubble'

// Human-in-the-loop rule: the AI only drafts. Sending requires this explicit click.
export function DraftReview({ message }: { message: Message }) {
  const approve = useApproveDraft()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversation</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <ChatBubble from="incoming" label={message.from}>
          {message.body}
        </ChatBubble>
        {message.draftReply ? (
          <ChatBubble from="draft" label="AI draft">
            {message.draftReply}
          </ChatBubble>
        ) : (
          <p className="text-sm text-muted-foreground">No draft yet.</p>
        )}
      </CardContent>
      <CardFooter className="flex-wrap justify-end gap-3 border-t pt-5">
        {approve.isError && (
          <p role="alert" className="mr-auto text-sm text-destructive">
            Couldn't approve. Please try again.
          </p>
        )}
        {message.approvedAt ? (
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <Check className="size-4 text-primary" aria-hidden /> Approved
          </p>
        ) : (
          <>
            {/* Enable once the API can save an edited draft before approval. */}
            <Button variant="secondary" disabled>
              Edit (coming soon)
            </Button>
            <Button
              disabled={!message.draftReply || approve.isPending}
              onClick={() => approve.mutate(message.id)}
            >
              {approve.isPending ? 'Approving…' : 'Approve & send'}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
