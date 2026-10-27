import { Link, type LinkProps } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import type { User } from '@/features/auth'
import { env } from '@/lib/env'
import { cn } from '@/lib/utils'
import { DismissibleBanner } from './dismissible-banner'
import { LiveDot } from './live-dot'
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
              className="inline-flex h-7 items-center rounded-full border border-hairline-2 px-3 text-xs font-medium text-bright transition-colors hover:border-dim"
            >
              Connect
            </Link>
          }
        >
          You're viewing demo data. Connect Outlook to see your real inbox.
        </DismissibleBanner>
      )}

      <header className="border-b border-hairline">
        <div className="mx-auto grid max-w-page grid-cols-[1fr_auto] items-center gap-x-6 gap-y-3 px-gutter py-4 md:grid-cols-[1fr_auto_1fr] md:py-5">
          <Link to="/inbox" className="justify-self-start rounded-md">
            <Logo />
          </Link>

          <nav
            aria-label="Main"
            className="col-span-2 row-start-2 -mx-2 flex gap-1 overflow-x-auto md:col-span-1 md:col-start-2 md:row-start-1 md:mx-0"
          >
            {nav.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm whitespace-nowrap transition-colors"
              >
                {({ isActive }) => (
                  <>
                    <span className={cn(isActive ? 'text-bright' : 'text-read hover:text-bright')}>
                      {label}
                    </span>
                    {/* Selected state: a small live signal beside the label. */}
                    {isActive && <LiveDot />}
                  </>
                )}
              </Link>
            ))}
          </nav>

          <Link
            to="/settings"
            className="flex items-center gap-2 justify-self-end rounded-full border border-hairline-2 py-1 pr-3 pl-1 text-sm text-bright transition-colors hover:border-dim md:col-start-3"
          >
            <span
              aria-hidden
              className="grid size-7 place-items-center rounded-full bg-hairline font-mono text-xs"
            >
              {user.name.charAt(0)}
            </span>
            <span className="hidden sm:inline">{user.name}</span>
            <ChevronRight className="size-3.5 text-read" aria-hidden />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-page px-gutter pt-10 pb-24 md:pt-14">{children}</main>
    </div>
  )
}
