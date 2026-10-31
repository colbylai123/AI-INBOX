import { X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { useShortcuts } from '@/lib/use-shortcuts'
import { cn } from '@/lib/utils'

// A key as shown, and as read out when the symbol alone wouldn't be.
type Key = string | { shown: string; spoken: string }

// Macs save with ⌘, everything else with Ctrl.
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
const modifier: Key = isMac ? { shown: '⌘', spoken: 'Command' } : 'Ctrl'

const groups: { title: string; shortcuts: { keys: Key[]; does: string }[] }[] = [
  {
    title: 'In the inbox',
    shortcuts: [
      { keys: ['/'], does: 'Search the inbox' },
      { keys: ['j', 'k'], does: 'Next or previous email' },
      { keys: ['Enter'], does: 'Open the email' },
    ],
  },
  {
    title: 'On an email',
    shortcuts: [
      { keys: ['j', 'k'], does: 'Open the next or previous email' },
      { keys: ['e'], does: 'Edit the draft' },
      { keys: ['/'], does: 'Back to the inbox, searching' },
      { keys: ['Esc'], does: 'Back to the inbox' },
    ],
  },
  {
    title: 'Editing a reply',
    shortcuts: [{ keys: [modifier, 'Enter'], does: 'Save your changes' }],
  },
  {
    title: 'Anywhere',
    shortcuts: [{ keys: ['?'], does: 'Show this list' }],
  },
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
      // Scrolls inside itself on short screens, so every shortcut can be reached.
      className="fixed right-4 bottom-4 left-4 z-20 max-h-[calc(100svh-2rem)] overflow-y-auto rounded-lg border border-card-edge bg-card p-5 shadow-panel sm:left-auto sm:w-96"
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
      <div className="mt-4 flex flex-col gap-4">
        {groups.map(({ title, shortcuts }) => (
          <div key={title}>
            <h3 className="text-label font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              {title}
            </h3>
            <dl className="mt-2 flex flex-col gap-2">
              {shortcuts.map(({ keys, does }) => (
                <div key={does} className="flex items-center justify-between gap-4 text-sm">
                  <dt className="text-muted-foreground">{does}</dt>
                  <dd className="flex shrink-0 gap-1">
                    {keys.map((key) => (
                      <kbd
                        key={typeof key === 'string' ? key : key.shown}
                        className="min-w-6 rounded-sm border border-border bg-muted px-1.5 text-center font-sans text-label font-medium"
                      >
                        {typeof key === 'string' ? (
                          key
                        ) : (
                          <>
                            <span aria-hidden>{key.shown}</span>
                            <span className="sr-only">{key.spoken}</span>
                          </>
                        )}
                      </kbd>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
      <p className="mt-4 text-metadata text-muted-foreground">
        Approve &amp; send has no shortcut, so a stray key can never send an email. Saving your
        changes doesn't send either.
      </p>
    </div>
  )
}
