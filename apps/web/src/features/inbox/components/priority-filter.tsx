import { Link } from '@tanstack/react-router'
import { LiveDot } from '@/components/layout/live-dot'
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
      {options.map((o) => {
        const selected = o.value === value
        return (
          <Link
            key={o.label}
            to="/inbox"
            search={{ priority: o.value }}
            aria-current={selected ? 'page' : undefined}
            className={cn(
              'inline-flex h-8 items-center gap-2 rounded-full border px-3.5 text-sm transition-colors',
              selected
                ? 'border-bright text-bright'
                : 'border-hairline-2 text-read hover:border-dim hover:text-bright',
            )}
          >
            {o.label}
            {selected && <LiveDot />}
          </Link>
        )
      })}
    </nav>
  )
}
