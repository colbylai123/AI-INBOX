import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { type Priority, priorities } from '../types'

const options: { label: string; value: Priority | undefined }[] = [
  { label: 'All', value: undefined },
  ...priorities.map((p) => ({ label: p[0]!.toUpperCase() + p.slice(1), value: p })),
]

// Filter state lives in the URL (?priority=high), so it survives reloads and can be shared.
export function PriorityFilter({ value }: { value: Priority | undefined }) {
  return (
    <nav aria-label="Filter by priority" className="flex flex-wrap gap-2">
      {options.map((o) => {
        const selected = o.value === value
        return (
          <Link
            key={o.label}
            to="/inbox"
            // Keeps any search words; only the priority changes.
            search={(prev) => ({ ...prev, priority: o.value })}
            // The router sets aria-current on the active option. Without this, "All"
            // (priority: undefined) would also count as active under ?priority=high.
            activeOptions={{ explicitUndefined: true }}
            className={cn(
              'inline-flex h-8 items-center rounded-md border px-3.5 text-interface font-medium transition-colors',
              selected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {o.label}
          </Link>
        )
      })}
    </nav>
  )
}
