import { cn } from '@/lib/utils'

/**
 * The system's small mint "live" signal. Only for a selected or live state, and
 * always next to a label that says what the state is (it is decorative to readers).
 */
export function LiveDot({ className }: { className?: string }) {
  return <span aria-hidden className={cn('size-1.5 shrink-0 rounded-full bg-live', className)} />
}
