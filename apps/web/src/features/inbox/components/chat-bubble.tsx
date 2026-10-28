import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Message text as a framed panel: incoming mail on the left in pale grey,
 * the AI's draft on the right in pale blue.
 */
export function ChatBubble({
  from,
  label,
  children,
}: {
  from: 'incoming' | 'draft'
  label?: string
  children: ReactNode
}) {
  const draft = from === 'draft'
  return (
    <div className={cn('flex flex-col gap-1.5', draft ? 'items-end' : 'items-start')}>
      {label && <span className="px-1 text-label font-medium text-muted-foreground">{label}</span>}
      <div
        className={cn(
          'max-w-[min(36rem,92%)] rounded-lg border px-4 py-3 text-interface leading-relaxed whitespace-pre-wrap',
          draft ? 'border-primary/20 bg-primary-soft' : 'border-border bg-muted',
        )}
      >
        {children}
      </div>
    </div>
  )
}
