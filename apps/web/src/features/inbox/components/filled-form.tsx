import { FileText } from 'lucide-react'
import { Fragment } from 'react'
import type { FilledForm } from '../types'

/** The form the AI pre-filled from Materials, shown as label/value pairs. */
export function FilledFormView({ form }: { form: FilledForm }) {
  return (
    <section aria-label={form.name} className="rounded-lg border border-hairline">
      <FilledFormHeader name={form.name} />
      <dl className="grid gap-x-6 gap-y-1 px-4 py-4 sm:grid-cols-[minmax(7rem,auto)_1fr] sm:gap-y-3">
        {form.fields.map((field) => (
          <Fragment key={field.id}>
            <dt className="font-mono text-xs text-meta sm:pt-0.5">{field.label}</dt>
            <dd className="mb-2 text-sm text-bright sm:mb-0">
              {field.value || <span className="text-meta">Not filled</span>}
            </dd>
          </Fragment>
        ))}
      </dl>
    </section>
  )
}

export function FilledFormHeader({ name }: { name: string }) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-3">
      <span className="flex min-w-0 items-center gap-2 text-sm text-bright">
        <FileText className="size-4 shrink-0 text-meta" aria-hidden />
        <span className="truncate">{name}</span>
      </span>
      <span className="font-mono text-xs whitespace-nowrap text-meta">Filled by AI</span>
    </header>
  )
}
