import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Message text shown as a chat bubble: incoming mail on the left in navy,
 * the AI's draft on the right in the accent blue.
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
      {label && <span className="px-2 text-xs font-medium text-muted-foreground">{label}</span>}
      <div
        className={cn(
          'max-w-[min(36rem,92%)] rounded-3xl px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap',
          draft
            ? 'rounded-br-md bg-primary text-primary-foreground shadow-lg shadow-primary/20'
            : 'rounded-tl-md bg-secondary',
        )}
      >
        {children}
      </div>
    </div>
  )
}
