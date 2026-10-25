import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useApproveDraft } from '../hooks/use-approve-draft'
import type { Message } from '../types'

// Human-in-the-loop rule: the AI only drafts. Sending requires this explicit click.
export function DraftReview({ message }: { message: Message }) {
  const approve = useApproveDraft()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Draft reply</CardTitle>
      </CardHeader>
      <CardContent className="text-sm whitespace-pre-wrap">
        {message.draftReply ?? 'No draft yet.'}
      </CardContent>
      <CardFooter className="flex-wrap gap-2">
        {message.approvedAt ? (
          <p className="flex items-center gap-1 text-sm font-medium">
            <Check className="size-4" aria-hidden /> Approved
          </p>
        ) : (
          <>
            <Button
              disabled={!message.draftReply || approve.isPending}
              onClick={() => approve.mutate(message.id)}
            >
              {approve.isPending ? 'Approving…' : 'Approve & send'}
            </Button>
            {/* Enable once the API can save an edited draft before approval. */}
            <Button variant="outline" disabled>
              Edit (coming soon)
            </Button>
          </>
        )}
        {approve.isError && (
          <p role="alert" className="text-sm text-destructive">
            Couldn't approve. Please try again.
          </p>
        )}
      </CardFooter>
    </Card>
  )
}
