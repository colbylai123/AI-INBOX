import { useId, useState } from 'react'
import { LiveDot } from '@/components/layout/live-dot'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useApproveDraft } from '../hooks/use-approve-draft'
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
  const editorId = useId()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversation</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {message.summary && (
          <p className="border-b border-hairline pb-5 text-sm">
            <span className="mr-3 font-mono text-xs text-meta">Summary</span>
            <span className="text-bright">{message.summary}</span>
          </p>
        )}
        <ChatBubble from="incoming" label={message.from}>
          {message.body}
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
            {message.filledForm && <FilledFormView form={message.filledForm} />}
          </>
        ) : (
          <p className="text-sm text-read">No draft yet.</p>
        )}
      </CardContent>
      <CardFooter className="flex-wrap justify-end gap-3 border-t border-hairline pt-5">
        {(approve.isError || save.isError) && (
          <p role="alert" className="mr-auto text-sm text-destructive">
            {save.isError ? "Couldn't save your changes." : "Couldn't approve."} Please try again.
          </p>
        )}
        {message.approvedAt ? (
          <p className="flex items-center gap-2 text-sm text-bright">
            <LiveDot /> Approved
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
              onClick={() => setEditing(true)}
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
