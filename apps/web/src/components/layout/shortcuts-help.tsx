import { X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { useShortcuts } from '@/lib/use-shortcuts'
import { cn } from '@/lib/utils'

const shortcuts: { keys: string[]; does: string }[] = [
  { keys: ['j', 'k'], does: 'Next or previous email' },
  { keys: ['Enter'], does: 'Open the email' },
  { keys: ['e'], does: 'Edit the draft' },
  { keys: ['Esc'], does: 'Back to the inbox' },
  { keys: ['?'], does: 'Show this list' },
]

/** The keyboard shortcuts, opened with "?". */
export function ShortcutsHelp() {
  const [open, setOpen] = useState(false)
  const headingId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef<Element | null>(null)

  useShortcuts({ '?': () => setOpen(true) }, !open)

  useEffect(() => {
    if (open) {
      returnFocus.current = document.activeElement
      closeRef.current?.focus()
    } else if (returnFocus.current instanceof HTMLElement) {
      returnFocus.current.focus()
    }
  }, [open])

  if (!open) return null
  return (
    <div
      role="dialog"
      aria-labelledby={headingId}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          // Handled here, so the page doesn't also treat it as "back to the inbox".
          event.preventDefault()
          setOpen(false)
        }
      }}
      className="fixed right-4 bottom-4 left-4 z-20 rounded-lg border border-white/65 bg-card p-5 shadow-panel sm:left-auto sm:w-80"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id={headingId} className="font-display text-base font-semibold tracking-tight">
          Keyboard shortcuts
        </h2>
        <button
          ref={closeRef}
          type="button"
          aria-label="Close"
          onClick={() => setOpen(false)}
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-8')}
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <dl className="mt-4 flex flex-col gap-2.5">
        {shortcuts.map(({ keys, does }) => (
          <div key={does} className="flex items-center justify-between gap-4 text-sm">
            <dt className="text-muted-foreground">{does}</dt>
            <dd className="flex gap-1">
              {keys.map((key) => (
                <kbd
                  key={key}
                  className="min-w-6 rounded-sm border border-border bg-muted px-1.5 text-center font-sans text-label font-medium"
                >
                  {key}
                </kbd>
              ))}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-metadata text-muted-foreground">
        Approve &amp; send has no shortcut, so a stray key can never send an email.
      </p>
    </div>
  )
}
