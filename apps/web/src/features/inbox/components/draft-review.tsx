import { useNavigate } from '@tanstack/react-router'
import { CircleCheck } from 'lucide-react'
import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useShortcuts } from '@/lib/use-shortcuts'
import { useApproveDraft } from '../hooks/use-approve-draft'
import { highlight } from '../lib/highlight'
import { useSaveDraft } from '../hooks/use-save-draft'
import type { Message } from '../types'
import { ChatBubble } from './chat-bubble'
import { DraftEditor } from './draft-editor'
import { FilledFormView } from './filled-form'

// Human-in-the-loop rule: the AI only drafts. The user can edit the reply and its
// filled form, and nothing is sent until they click Approve & send.
export function DraftReview({ message }: { message: Message }) {
  const approve = useApproveDraft()
  const save = useSaveDraft(message.id)
  const [editing, setEditing] = useState(false)
  const [showSources, setShowSources] = useState(false)
  const editorId = useId()
  const sources = showSources && !editing ? (message.filledForm?.fields ?? []) : []
  const navigate = useNavigate()

  const canEdit = !message.approvedAt && !!message.draftReply && !approve.isPending
  const startEditing = () => {
    approve.reset()
    setEditing(true)
  }
  // No shortcut approves: sending always takes a click on Approve & send.
  useShortcuts(
    {
      ...(canEdit && { e: startEditing }),
      Escape: () => void navigate({ to: '/inbox' }),
    },
    !editing,
  )
  const phrases = sources.flatMap((field) => (field.source ? [field.source] : []))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversation</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {(message.summary || message.priorityReason) && (
          <dl className="grid gap-x-4 gap-y-2 border-b border-border pb-5 text-interface sm:grid-cols-[auto_1fr]">
            {message.summary && (
              <>
                <dt className="text-label font-semibold text-muted-foreground sm:pt-0.5">
                  Summary
                </dt>
                <dd>{message.summary}</dd>
              </>
            )}
            {message.priorityReason && (
              <>
                <dt className="text-label font-semibold text-muted-foreground sm:pt-0.5">
                  Why {message.priority}
                </dt>
                <dd>{message.priorityReason}</dd>
              </>
            )}
          </dl>
        )}
        {/* With sources on, mark the words the form's values came from, in the
            sender's address as well as the body. */}
        <ChatBubble from="incoming" label={highlight(message.from, phrases)}>
          {highlight(message.body, phrases)}
        </ChatBubble>
        {editing ? (
          <DraftEditor
            id={editorId}
            message={message}
            onSubmit={(update) => save.mutate(update, { onSuccess: () => setEditing(false) })}
          />
        ) : message.draftReply ? (
          <>
            <ChatBubble from="draft" label="AI draft">
              {message.draftReply}
            </ChatBubble>
            {message.filledForm && (
              <FilledFormView
                form={message.filledForm}
                showSources={showSources}
                onShowSourcesChange={setShowSources}
              />
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No draft yet.</p>
        )}
      </CardContent>
      {/* On phones the actions stay on screen while you read a long email. */}
      <CardFooter className="flex-wrap justify-end gap-3 border-t border-border pt-5 max-md:sticky max-md:bottom-0 max-md:z-10 max-md:-mb-6 max-md:rounded-b-lg max-md:bg-card max-md:pb-4">
        {(approve.isError || save.isError) && (
          <p role="alert" className="mr-auto text-sm text-destructive">
            {save.isError ? "Couldn't save your changes." : "Couldn't approve."} Please try again.
          </p>
        )}
        {message.approvedAt ? (
          <p className="flex items-center gap-2 text-interface font-medium">
            <CircleCheck className="size-4 text-primary" aria-hidden /> Approved
          </p>
        ) : editing ? (
          <>
            <Button
              variant="secondary"
              disabled={save.isPending}
              onClick={() => {
                save.reset()
                setEditing(false)
              }}
            >
              Cancel
            </Button>
            <Button type="submit" form={editorId} disabled={save.isPending}>
              {save.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="secondary"
              disabled={!message.draftReply || approve.isPending}
              onClick={startEditing}
            >
              Edit
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
