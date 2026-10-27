import { Link, type LinkProps } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import type { User } from '@/features/auth'
import { env } from '@/lib/env'
import { DismissibleBanner } from './dismissible-banner'
import { Logo } from './logo'

// Add a nav entry here when you add a top-level page under routes/_app/.
const nav: { to: LinkProps['to']; label: string }[] = [
  { to: '/inbox', label: 'Inbox' },
  { to: '/materials', label: 'Materials' },
  { to: '/settings', label: 'Settings' },
]

export function AppShell({ user, children }: { user: User; children: ReactNode }) {
  return (
    <div className="min-h-svh">
      {env.VITE_USE_MOCKS && (
        <DismissibleBanner
          storageKey="banner:demo-data"
          action={
            <Link
              to="/settings"
              className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase hover:bg-white/15"
            >
              Connect
            </Link>
          }
        >
          You're viewing demo data. Connect Outlook to see your real inbox.
        </DismissibleBanner>
      )}

      <header className="mx-auto grid max-w-6xl grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 px-4 py-5 md:grid-cols-[1fr_auto_1fr] md:px-8 md:py-7">
        <Link to="/inbox" className="justify-self-start">
          <Logo />
        </Link>

        <nav
          aria-label="Main"
          className="col-span-2 row-start-2 flex gap-1 overflow-x-auto md:col-span-1 md:col-start-2 md:row-start-1 md:gap-2"
        >
          {nav.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="rounded-full px-4 py-2 text-sm font-semibold tracking-wider whitespace-nowrap text-muted-foreground uppercase transition-colors hover:text-foreground"
              activeProps={{ className: 'bg-white/5 text-foreground' }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <Link
          to="/settings"
          className="flex items-center gap-2 justify-self-end rounded-full bg-secondary py-1.5 pr-3 pl-1.5 text-xs font-semibold tracking-wider uppercase hover:bg-accent md:col-start-3"
        >
          <span
            aria-hidden
            className="grid size-7 place-items-center rounded-full bg-primary text-[11px] text-primary-foreground"
          >
            {user.name.charAt(0)}
          </span>
          <span className="hidden sm:inline">{user.name}</span>
          <ChevronRight className="size-3.5" aria-hidden />
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-4 pb-20 md:px-8 md:pt-10">{children}</main>
    </div>
  )
}
