import { X } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function readDismissed(key: string) {
  try {
    return localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

/**
 * Thin announcement bar across the top of the page. Once closed it stays closed
 * in this browser (per `storageKey`); bump the key to show a new message again.
 */
export function DismissibleBanner({
  storageKey,
  children,
  action,
}: {
  storageKey: string
  children: ReactNode
  action?: ReactNode
}) {
  const [dismissed, setDismissed] = useState(() => readDismissed(storageKey))
  if (dismissed) return null

  const dismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(storageKey, '1')
    } catch {
      // Storage can be unavailable (private mode); closing still works for this visit.
    }
  }

  return (
    <div role="region" aria-label="Announcement" className="border-b border-border bg-primary-soft">
      <div className="mx-auto flex max-w-page items-center gap-3 px-gutter py-2.5 text-sm">
        <div className="flex flex-1 flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-center">
          <span>{children}</span>
          {action}
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-8')}
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}
