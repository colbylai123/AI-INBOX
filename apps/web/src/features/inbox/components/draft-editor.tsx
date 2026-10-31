import type { FormEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { DraftUpdate, Message } from '../types'
import { FilledFormHeader } from './filled-form'

/**
 * Editable copy of the AI's reply and its filled form. Submitted by the Save
 * button in DraftReview's footer through the form `id`, or with Ctrl+Enter.
 */
export function DraftEditor({
  id,
  message,
  onSubmit,
}: {
  id: string
  message: Message
  onSubmit: (update: DraftUpdate) => void
}) {
  const fields = message.filledForm?.fields ?? []

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const draftReply = String(data.get('draftReply') ?? '').trim()
    if (!draftReply) {
      // `required` lets spaces through; a blank reply can't be approved later.
      const reply = event.currentTarget.elements.namedItem('draftReply') as HTMLTextAreaElement
      reply.setCustomValidity('Write a reply before saving.')
      reply.reportValidity()
      return
    }
    onSubmit({
      draftReply,
      formValues: Object.fromEntries(
        fields.map((f) => [f.id, String(data.get(`field.${f.id}`) ?? '')]),
      ),
    })
  }

  return (
    <form
      id={id}
      onSubmit={handleSubmit}
      onKeyDown={(event) => {
        // Ctrl+Enter (⌘+Enter on a Mac) saves the edits. It never sends: that
        // still takes a click on Approve & send.
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
          event.preventDefault()
          event.currentTarget.requestSubmit()
        }
      }}
      className="flex flex-col gap-5"
    >
      <label className="flex flex-col gap-1.5">
        <span className="px-1 text-label font-medium text-muted-foreground">Reply</span>
        <Textarea
          name="draftReply"
          defaultValue={message.draftReply ?? ''}
          required
          autoFocus
          onInput={(event) => event.currentTarget.setCustomValidity('')}
        />
      </label>
      {message.filledForm && (
        <fieldset className="rounded-lg border border-white/65">
          <legend className="sr-only">{message.filledForm.name}</legend>
          <FilledFormHeader name={message.filledForm.name} />
          <div className="grid gap-4 px-4 py-4 sm:grid-cols-2">
            {fields.map((field) => (
              <label key={field.id} className="flex flex-col gap-1.5">
                <span className="text-label font-medium text-muted-foreground">{field.label}</span>
                <Input name={`field.${field.id}`} defaultValue={field.value} />
              </label>
            ))}
          </div>
        </fieldset>
      )}
    </form>
  )
}
