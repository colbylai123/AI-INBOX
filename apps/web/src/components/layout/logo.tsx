import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'flex items-center gap-2.5 font-display text-[15px] font-semibold tracking-[-0.03em]',
        className,
      )}
    >
      <span className="relative grid size-8 place-items-center rounded-md bg-foreground text-background shadow-[0_0_0_1px_rgb(15_23_42/0.2)]">
        <Inbox className="size-4" aria-hidden />
        <span
          aria-hidden
          className="absolute -top-1 -right-1 size-2.5 rounded-full bg-approve shadow-[0_0_0_2px_white,0_0_8px_rgb(47_90_173/0.55)]"
        />
      </span>
      ai inbox
    </span>
  )
}
