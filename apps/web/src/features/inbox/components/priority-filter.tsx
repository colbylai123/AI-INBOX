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
    <nav aria-label="Filter by priority" className="mb-6 flex flex-wrap gap-2">
      {options.map((o) => (
        <Link
          key={o.label}
          to="/inbox"
          search={{ priority: o.value }}
          aria-current={o.value === value ? 'page' : undefined}
          className={cn(
            'rounded-full bg-secondary px-4 py-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase transition-colors hover:text-foreground',
            o.value === value && 'bg-primary text-primary-foreground hover:text-primary-foreground',
          )}
        >
          {o.label}
        </Link>
      ))}
    </nav>
  )
}
