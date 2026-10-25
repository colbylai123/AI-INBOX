import { Link, type LinkProps } from '@tanstack/react-router'
import { FileText, Inbox, type LucideIcon, Settings } from 'lucide-react'
import type { ReactNode } from 'react'
import type { User } from '@/features/auth'

// Add a nav entry here when you add a top-level page under routes/_app/.
const nav: { to: LinkProps['to']; label: string; icon: LucideIcon }[] = [
  { to: '/inbox', label: 'Inbox', icon: Inbox },
  { to: '/materials', label: 'Materials', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function AppShell({ user, children }: { user: User; children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <aside className="flex flex-col border-b md:w-56 md:border-r md:border-b-0">
        <div className="px-4 py-4 font-semibold">AI Inbox</div>
        <nav aria-label="Main" className="flex gap-1 px-2 pb-2 md:flex-1 md:flex-col">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
              activeProps={{ className: 'bg-accent font-medium text-foreground' }}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden truncate border-t px-4 py-3 text-xs text-muted-foreground md:block">
          {user.email}
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  )
}
