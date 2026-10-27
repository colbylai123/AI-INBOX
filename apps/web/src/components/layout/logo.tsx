import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn('flex items-center gap-2.5 text-lg font-semibold tracking-tight', className)}
    >
      <span className="grid size-8 place-items-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/30">
        <Inbox className="size-4" aria-hidden />
      </span>
      ai inbox
    </span>
  )
}
