import { CircleAlert, CircleCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** An inline result message: "success" is announced politely, "error" right away. */
export function Notice({
  tone,
  children,
  className,
}: {
  tone: 'success' | 'error'
  children: ReactNode
  className?: string
}) {
  const Icon = tone === 'success' ? CircleCheck : CircleAlert
  return (
    <div
      role={tone === 'success' ? 'status' : 'alert'}
      className={cn(
        'flex items-start gap-2.5 rounded-md border px-4 py-3 text-sm',
        tone === 'success'
          ? 'border-primary/20 bg-primary-soft'
          : 'border-destructive/25 bg-destructive/5 text-destructive',
        className,
      )}
    >
      <Icon
        className={cn('mt-0.5 size-4 shrink-0', tone === 'success' && 'text-primary')}
        aria-hidden
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
