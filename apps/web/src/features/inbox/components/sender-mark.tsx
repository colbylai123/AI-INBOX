import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import { senderHue, senderName } from '../lib/sender'

/** The round mark at the left of a row and an open email: the sender's initial on a soft tint. */
export function SenderMark({ from, className }: { from: string; className?: string }) {
  return (
    <span
      aria-hidden
      style={{ '--hue': senderHue(from) } as CSSProperties}
      className={cn(
        'grid size-10 shrink-0 place-items-center rounded-full text-interface font-semibold',
        'bg-[hsl(var(--hue)_42%_88%)] text-[hsl(var(--hue)_35%_22%)]',
        'dark:bg-[hsl(var(--hue)_22%_30%)] dark:text-[hsl(var(--hue)_40%_90%)]',
        className,
      )}
    >
      {senderName(from).charAt(0)}
    </span>
  )
}
