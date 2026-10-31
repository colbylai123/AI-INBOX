import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// Both pills lift a little and change color on hover. With reduced motion only the
// color changes (the lift is motion-safe, and globals.css stops transitions).
const lift =
  'transition-[background-color,color,translate,box-shadow] motion-safe:hover:-translate-y-0.5'

/** The muted dusty-lavender pill at the top right of the hero. Opens the demo. */
export function DemoPill({ className }: { className?: string }) {
  return (
    // Entering the demo changes state, so it isn't preloaded on hover.
    <Link
      to="/demo"
      preload={false}
      className={cn(
        'inline-flex h-10 shrink-0 items-center rounded-full bg-[var(--lp-pill)] px-5 text-metadata font-semibold text-[var(--approve-foreground)] hover:bg-[var(--lp-pill-hover)]',
        lift,
        className,
      )}
    >
      Try the demo
    </Link>
  )
}

/** The white pill with the lime-green arrow. The arrow is always there and nudges on hover. */
export function ArrowPill({ className }: { className?: string }) {
  return (
    <Link
      to="/demo"
      preload={false}
      className={cn(
        'group inline-flex h-14 items-center gap-4 rounded-full bg-white py-2 pr-2 pl-7 text-interface font-semibold text-[#231d33] shadow-[0_10px_30px_-12px_rgb(35_29_51/0.35)] hover:bg-[#f6f2fc] hover:shadow-[0_16px_36px_-14px_rgb(35_29_51/0.45)]',
        lift,
        className,
      )}
    >
      Try the demo
      <span
        aria-hidden
        className="grid size-10 place-items-center rounded-full bg-[var(--lp-lime)] text-[var(--lp-on-lime)] transition-colors group-hover:bg-[#b3e43a]"
      >
        <ArrowRight className="size-5 group-hover:motion-safe:animate-[nudge_0.6s_ease-in-out]" />
      </span>
    </Link>
  )
}
