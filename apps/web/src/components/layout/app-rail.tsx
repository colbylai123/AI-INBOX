import { Link, type LinkProps } from '@tanstack/react-router'
import { FileText, Mail, Settings, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// Add an entry here when you add a top-level page under routes/_app/.
const pages: { to: LinkProps['to']; label: string; icon: LucideIcon }[] = [
  { to: '/inbox', label: 'Inbox', icon: Mail },
  { to: '/materials', label: 'Materials', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
]

/** The app's pages as icons: a column beside the canvas, or one row on phones. */
export function AppRail({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Main"
      className={cn('flex gap-2 px-3 pb-3 sm:px-4 lg:flex-col lg:px-3 lg:pt-2 lg:pb-0', className)}
    >
      {pages.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          // The page stays marked while an email is open (/inbox/m1) or a filter is on.
          activeOptions={{ includeSearch: false }}
          title={label}
          className="grid size-11 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:bg-rail-active aria-[current=page]:text-foreground"
        >
          <Icon className="size-5" aria-hidden />
          <span className="sr-only">{label}</span>
        </Link>
      ))}
    </nav>
  )
}
