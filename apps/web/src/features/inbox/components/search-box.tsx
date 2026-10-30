import { Search, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { useShortcuts } from '@/lib/use-shortcuts'

/** The inbox search box. "/" jumps to it, Escape clears it. */
export function SearchBox({
  query,
  onQueryChange,
}: {
  query: string | undefined
  onQueryChange: (query: string | undefined) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(query ?? '')
  const [focused, setFocused] = useState(false)
  // While the user types, the box leads and the URL follows. Otherwise the box
  // follows the URL, such as when the Inbox link clears the search.
  if (!focused && (query ?? '') !== value) setValue(query ?? '')

  useShortcuts({ '/': () => inputRef.current?.focus() })

  const change = (next: string) => {
    setValue(next)
    onQueryChange(next.trim() ? next : undefined)
  }

  return (
    <div role="search" className="relative w-full sm:max-w-xs">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        ref={inputRef}
        type="search"
        aria-label="Search the inbox"
        placeholder="Search"
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
        className="pr-9 pl-9 [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            change('')
            inputRef.current?.focus()
          }}
          className="absolute top-1/2 right-1.5 grid size-6 -translate-y-1/2 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      )}
    </div>
  )
}
