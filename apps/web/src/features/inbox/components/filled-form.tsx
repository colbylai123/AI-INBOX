import { FileText } from 'lucide-react'
import { Fragment } from 'react'
import type { FilledForm } from '../types'

/** The form the AI pre-filled from Materials, shown as label/value pairs. */
export function FilledFormView({ form }: { form: FilledForm }) {
  return (
    <section aria-label={form.name} className="rounded-lg border border-border">
      <FilledFormHeader name={form.name} />
      <dl className="grid gap-x-6 gap-y-1 px-4 py-4 sm:grid-cols-[minmax(7rem,auto)_1fr] sm:gap-y-3">
        {form.fields.map((field) => (
          <Fragment key={field.id}>
            <dt className="text-metadata text-muted-foreground sm:pt-px">{field.label}</dt>
            <dd className="mb-2 text-interface sm:mb-0">
              {field.value || <span className="text-muted-foreground italic">Not filled</span>}
            </dd>
          </Fragment>
        ))}
      </dl>
    </section>
  )
}

export function FilledFormHeader({ name }: { name: string }) {
  return (
    <header className="flex items-center justify-between gap-3 rounded-t-lg border-b border-border bg-muted px-4 py-3">
      <span className="flex min-w-0 items-center gap-2 text-interface font-semibold">
        <FileText className="size-4 shrink-0 text-primary" aria-hidden />
        <span className="truncate">{name}</span>
      </span>
      <span className="text-metadata whitespace-nowrap text-muted-foreground">Filled by AI</span>
    </header>
  )
}
