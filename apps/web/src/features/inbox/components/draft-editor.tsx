import type { FormEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { DraftUpdate, Message } from '../types'
import { FilledFormHeader } from './filled-form'

/**
 * Editable copy of the AI's reply and its filled form. Submitted by the Save
 * button in DraftReview's footer through the form `id`.
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
    onSubmit({
      draftReply: String(data.get('draftReply') ?? ''),
      formValues: Object.fromEntries(
        fields.map((f) => [f.id, String(data.get(`field.${f.id}`) ?? '')]),
      ),
    })
  }

  return (
    <form id={id} onSubmit={handleSubmit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-1.5">
        <span className="px-1 font-mono text-xs text-meta">Reply</span>
        <Textarea name="draftReply" defaultValue={message.draftReply ?? ''} required autoFocus />
      </label>
      {message.filledForm && (
        <fieldset className="rounded-lg border border-hairline">
          <legend className="sr-only">{message.filledForm.name}</legend>
          <FilledFormHeader name={message.filledForm.name} />
          <div className="grid gap-4 px-4 py-4 sm:grid-cols-2">
            {fields.map((field) => (
              <label key={field.id} className="flex flex-col gap-1.5">
                <span className="font-mono text-xs text-meta">{field.label}</span>
                <Input name={`field.${field.id}`} defaultValue={field.value} />
              </label>
            ))}
          </div>
        </fieldset>
      )}
    </form>
  )
}
