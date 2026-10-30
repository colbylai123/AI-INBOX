import { Link } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import { type ReactNode, useId, useState } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const storageKey = 'getting-started:hidden'

function readHidden() {
  try {
    return localStorage.getItem(storageKey) === '1'
  } catch {
    return false
  }
}

/**
 * The three things a new user does before the product pays off. Shown at the top
 * of the inbox until all are done, or until the user hides it.
 */
export function GettingStarted({
  connected,
  hasMaterials,
  hasApproved,
  topMessageId,
}: {
  connected: boolean
  hasMaterials: boolean
  hasApproved: boolean
  /** The first message in the inbox, for the "approve a draft" step. */
  topMessageId?: string
}) {
  const [hidden, setHidden] = useState(readHidden)
  const headingId = useId()
  const action = buttonVariants({ variant: 'outline', size: 'sm' })

  const steps: { done: boolean; title: string; body: string; action?: ReactNode }[] = [
    {
      done: connected,
      title: 'Connect Outlook',
      body: 'New mail arrives here ranked and summed up.',
      action: (
        <Link to="/settings" className={action}>
          Open Settings
        </Link>
      ),
    },
    {
      done: hasMaterials,
      title: 'Upload a form you fill in often',
      body: 'A quote sheet or an order form. The AI fills it in when an email calls for it.',
      action: (
        <Link to="/materials" className={action}>
          Go to Materials
        </Link>
      ),
    },
    {
      done: hasApproved,
      title: 'Approve your first draft',
      body: 'Open your top email, check the reply and the form, then approve it.',
      action: topMessageId && (
        <Link to="/inbox/$messageId" params={{ messageId: topMessageId }} className={action}>
          Open top email
        </Link>
      ),
    },
  ]
  const doneCount = steps.filter((step) => step.done).length
  if (hidden || doneCount === steps.length) return null

  const hide = () => {
    setHidden(true)
    try {
      localStorage.setItem(storageKey, '1')
    } catch {
      // Storage can be unavailable (private mode); hiding still works for this visit.
    }
  }

  return (
    <section
      aria-labelledby={headingId}
      className="mb-8 rounded-lg border border-border bg-card p-5 shadow-panel md:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2
            id={headingId}
            className="font-display text-lg leading-tight font-bold tracking-tight"
          >
            Get set up
          </h2>
          <p className="mt-1 text-metadata text-muted-foreground">
            {doneCount} of {steps.length} done
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={hide}>
          Hide
        </Button>
      </div>
      <div
        role="progressbar"
        aria-label="Setup progress"
        aria-valuemin={0}
        aria-valuemax={steps.length}
        aria-valuenow={doneCount}
        className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${(doneCount / steps.length) * 100}%` }}
        />
      </div>
      <ol className="mt-5 grid gap-3 md:grid-cols-3">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className={cn(
              'flex gap-3 rounded-md border border-border p-4',
              step.done && 'bg-muted/60',
            )}
          >
            <span
              className={cn(
                'grid size-6 shrink-0 place-items-center rounded-full border text-label font-semibold',
                step.done
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground',
              )}
            >
              {step.done ? <Check className="size-3.5" aria-hidden /> : index + 1}
            </span>
            <div className="min-w-0">
              <p className={cn('font-semibold', step.done && 'text-muted-foreground')}>
                {step.title}
                {step.done && <span className="sr-only"> (done)</span>}
              </p>
              {!step.done && (
                <>
                  <p className="mt-1 text-metadata text-muted-foreground">{step.body}</p>
                  {step.action && <div className="mt-3">{step.action}</div>}
                </>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
