import type * as React from 'react'
import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'field-sizing-content min-h-24 w-full rounded-md border border-input bg-card px-3 py-2 text-interface leading-relaxed shadow-xs transition-colors placeholder:text-muted-foreground hover:border-muted-foreground/40 disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
