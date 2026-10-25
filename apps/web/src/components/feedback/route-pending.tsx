import { LoaderCircle } from 'lucide-react'

export function RoutePending() {
  return (
    <div className="flex items-center gap-2 p-8 text-sm text-muted-foreground">
      <LoaderCircle className="size-4 animate-spin" aria-hidden />
      Loading…
    </div>
  )
}
