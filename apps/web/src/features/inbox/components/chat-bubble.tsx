import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Message text as a framed panel: incoming mail on the left on the ground color,
 * the AI's draft on the right in raised graphite.
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
      {label && <span className="px-1 font-mono text-xs text-meta">{label}</span>}
      <div
        className={cn(
          'max-w-[min(36rem,92%)] rounded-lg border px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
          draft
            ? 'border-hairline-2 bg-hairline-2 text-bright'
            : 'border-hairline bg-ground text-read',
        )}
      >
        {children}
      </div>
    </div>
  )
}
