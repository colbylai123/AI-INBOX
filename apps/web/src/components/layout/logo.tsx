import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5 text-base text-bright', className)}>
      <span className="grid size-8 place-items-center rounded-md border border-hairline-2 bg-panel">
        <Inbox className="size-4" aria-hidden />
      </span>
      ai inbox
    </span>
  )
}
