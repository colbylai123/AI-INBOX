import { LoaderCircle } from 'lucide-react'

/** Shown while a page loads. Screen readers hear "Loading…" without being interrupted. */
export function RoutePending() {
  return (
    <div role="status" className="flex items-center gap-2 p-8 text-sm text-muted-foreground">
      <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
      Loading…
    </div>
  )
}
