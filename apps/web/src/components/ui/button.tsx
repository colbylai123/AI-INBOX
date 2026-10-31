import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'
import { cn } from '@/lib/utils'

// The amber pill is the one bright action. Everything else is a white or quiet button.
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 text-interface font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,translate,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:pointer-events-none disabled:opacity-50 motion-safe:hover:-translate-y-px motion-safe:active:translate-y-0 motion-safe:active:opacity-80 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'rounded-full bg-approve font-semibold text-approve-foreground shadow-glow hover:bg-approve-hover',
        approve:
          'rounded-full bg-approve font-semibold text-approve-foreground shadow-glow hover:bg-approve-hover',
        destructive:
          'rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'rounded-xl border border-card-edge bg-card text-foreground hover:bg-muted dark:bg-raised dark:hover:bg-muted',
        secondary:
          'rounded-xl border border-card-edge bg-card text-foreground hover:bg-muted dark:bg-raised dark:hover:bg-muted',
        ghost: 'rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground',
        link: 'text-foreground underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4',
        sm: 'h-8 px-3 text-metadata',
        lg: 'h-11 px-5',
        icon: 'size-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
