import { ListFilter, Search, X } from 'lucide-react'
import { type ReactNode, useId, useRef, useState } from 'react'
import { useDisclosure } from '@/lib/use-disclosure'
import { useShortcuts } from '@/lib/use-shortcuts'
import { cn } from '@/lib/utils'

/**
 * The inbox search field, across the top of the canvas. "/" jumps to it and Escape
 * clears it. The filter button at its right end opens the priority and account filters.
 */
export function SearchBox({
  query,
  onQueryChange,
  filters,
  filtersOn = false,
}: {
  query: string | undefined
  onQueryChange: (query: string | undefined) => void
  filters?: ReactNode
  /** A filter is applied, so the button says so. */
  filtersOn?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(query ?? '')
  const [focused, setFocused] = useState(false)
  const panelId = useId()
  const filtersPanel = useDisclosure()
  const { buttonRef, panelRef } = filtersPanel
  // While the user types, the box leads and the URL follows. Otherwise the box
  // follows the URL, such as when the Inbox link clears the search.
  if (!focused && (query ?? '') !== value) setValue(query ?? '')

  useShortcuts({ '/': () => inputRef.current?.focus() })

  const change = (next: string) => {
    setValue(next)
    onQueryChange(next.trim() ? next : undefined)
  }

  return (
    <div className="relative" onBlur={filtersPanel.onBlur}>
      <div role="search" className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          ref={inputRef}
          type="search"
          aria-label="Search the inbox"
          placeholder="Search email or name…"
          autoComplete="off"
          value={value}
          onChange={(event) => change(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(event) => {
            if (event.key !== 'Escape') return
            event.preventDefault()
            if (value) change('')
            else inputRef.current?.blur()
          }}
          // The browser's own clear button is replaced by the one below, which every browser shows.
          className="h-11 w-full rounded-full border border-card-edge bg-card pr-20 pl-11 text-interface text-foreground shadow-panel placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:appearance-none"
        />
        <span className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-0.5">
          {value && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                change('')
                inputRef.current?.focus()
              }}
              className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
          {filters && (
            <button
              ref={buttonRef}
              type="button"
              aria-label={filtersOn ? 'Filters, on' : 'Filters'}
              aria-expanded={filtersPanel.open}
              aria-controls={panelId}
              title="Filters"
              onClick={filtersPanel.toggle}
              className={cn(
                'relative grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                (filtersPanel.open || filtersOn) && 'text-foreground',
              )}
            >
              <ListFilter className="size-4" aria-hidden />
              {filtersOn && (
                <span
                  aria-hidden
                  className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary"
                />
              )}
            </button>
          )}
        </span>
      </div>
      {filters && (
        <div
          ref={panelRef}
          id={panelId}
          hidden={!filtersPanel.open}
          className="absolute top-full right-0 z-30 mt-2 w-[min(22rem,100%)] rounded-2xl border border-card-edge bg-card p-4 shadow-[0_12px_40px_-12px_rgb(0_0_0/0.35)]"
        >
          <div className="flex flex-col gap-4">{filters}</div>
        </div>
      )}
    </div>
  )
}
