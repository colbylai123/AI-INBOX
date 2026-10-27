import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[11px] tracking-wide whitespace-nowrap uppercase',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-bright text-inverse-ink',
        secondary: 'border-hairline-2 text-read',
        destructive: 'border-transparent bg-destructive text-inverse-ink',
        outline: 'border-hairline text-meta',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
