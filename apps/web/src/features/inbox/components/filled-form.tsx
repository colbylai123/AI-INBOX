import { FileText, TextQuote } from 'lucide-react'
import { Fragment, type ReactNode } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { FilledForm } from '../types'

/**
 * The form the AI pre-filled from Materials, shown as label/value pairs. With
 * sources on, each value quotes the words it came from, in the email or in one
 * of the user's documents.
 */
export function FilledFormView({
  form,
  showSources = false,
  onShowSourcesChange,
}: {
  form: FilledForm
  showSources?: boolean
  onShowSourcesChange?: (show: boolean) => void
}) {
  return (
    <section aria-label={form.name} className="rounded-lg border border-card-edge">
      <FilledFormHeader
        name={form.name}
        action={
          onShowSourcesChange && (
            <button
              type="button"
              aria-pressed={showSources}
              onClick={() => onShowSourcesChange(!showSources)}
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'h-7 px-2 aria-pressed:bg-muted aria-pressed:text-foreground',
              )}
            >
              <TextQuote aria-hidden /> Show sources
            </button>
          )
        }
      />
      <dl className="grid gap-x-6 gap-y-1 px-4 py-4 sm:grid-cols-[minmax(7rem,auto)_1fr] sm:gap-y-3">
        {form.fields.map((field) => (
          <Fragment key={field.id}>
            <dt className="text-metadata text-muted-foreground sm:pt-px">{field.label}</dt>
            <dd className="mb-2 text-interface sm:mb-0">
              {field.value || <span className="text-muted-foreground italic">Not filled</span>}
              {showSources && field.value && (
                <span className="mt-1 block text-metadata text-muted-foreground">
                  {!field.source ? (
                    'Not from the email or your documents, so check it.'
                  ) : field.sourceMaterial ? (
                    <>
                      From {field.sourceMaterial.name}: “{field.source}”
                    </>
                  ) : (
                    <>From the email: “{field.source}”</>
                  )}
                </span>
              )}
            </dd>
          </Fragment>
        ))}
      </dl>
    </section>
  )
}

export function FilledFormHeader({ name, action }: { name: string; action?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-t-lg border-b border-border bg-muted px-4 py-3">
      <span className="flex min-w-0 items-center gap-2 text-interface font-semibold">
        <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="truncate">{name}</span>
      </span>
      <span className="flex items-center gap-2 text-metadata whitespace-nowrap text-muted-foreground">
        Filled by AI
        {action}
      </span>
    </header>
  )
}
