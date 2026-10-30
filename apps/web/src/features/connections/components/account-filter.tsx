import { ChevronDown } from 'lucide-react'
import { type Connection, providerNames } from '../types'

/** Shows one account's mail in the inbox, or every account's. */
export function AccountFilter({
  connections,
  value,
  onChange,
}: {
  connections: Connection[]
  value: string | undefined
  onChange: (connectionId: string | undefined) => void
}) {
  return (
    <label className="flex min-w-0 items-center gap-2 text-metadata text-muted-foreground max-sm:w-full">
      Account
      <span className="relative min-w-0 max-sm:flex-1">
        <select
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value || undefined)}
          className="h-8 w-full max-w-full min-w-0 appearance-none truncate rounded-md border border-input bg-card pr-8 pl-3 text-interface font-medium text-foreground shadow-xs transition-colors hover:border-muted-foreground/40"
        >
          <option value="">All accounts</option>
          {connections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.accountEmail} ({providerNames[c.provider]})
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      </span>
    </label>
  )
}
