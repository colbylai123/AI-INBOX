import { Link, type LinkProps } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import type { User } from '@/features/auth'
import { useDemoMode } from '@/lib/demo-mode'
import { env } from '@/lib/env'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DemoBar } from './demo-bar'
import { DismissibleBanner } from './dismissible-banner'
import { Logo } from './logo'
import { ShortcutsHelp } from './shortcuts-help'

// Add a nav entry here when you add a top-level page under routes/_app/.
const nav: { to: LinkProps['to']; label: string }[] = [
  { to: '/inbox', label: 'Inbox' },
  { to: '/materials', label: 'Materials' },
  { to: '/settings', label: 'Settings' },
]

export function AppShell({ user, children }: { user: User; children: ReactNode }) {
  const demo = useDemoMode()
  return (
    <div className="min-h-svh">
      {demo && <DemoBar />}
      {/* Development on mocks; a visitor in the demo sees the demo bar instead. */}
      {env.VITE_USE_MOCKS && !demo && (
        <DismissibleBanner
          storageKey="banner:demo-data"
          action={
            <Link to="/settings" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              Connect
            </Link>
          }
        >
          You're viewing demo data. Connect your email to see your real inbox.
        </DismissibleBanner>
      )}

      <header className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-page grid-cols-[1fr_auto] items-center gap-x-6 gap-y-3 px-gutter py-4 md:grid-cols-[1fr_auto_1fr] md:py-5">
          <Link to="/inbox" className="justify-self-start rounded-md">
            <Logo />
          </Link>

          <nav
            aria-label="Main"
            // The padding keeps focus outlines from being clipped by the scroll area.
            className="col-span-2 row-start-2 -mx-3 -my-1 flex gap-1 overflow-x-auto p-1 md:col-span-1 md:col-start-2 md:row-start-1 md:-mx-1"
          >
            {nav.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                // The router marks the current page with aria-current="page".
                className={cn(
                  'rounded-md px-3 py-1.5 text-interface font-medium whitespace-nowrap text-muted-foreground transition-colors',
                  'hover:bg-muted hover:text-foreground',
                  'aria-[current=page]:bg-primary-soft aria-[current=page]:text-primary',
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          <Link
            to="/settings"
            className="flex items-center gap-2 justify-self-end rounded-md border border-border bg-card py-1 pr-2.5 pl-1 text-interface shadow-xs transition-colors hover:bg-muted md:col-start-3"
          >
            <span
              aria-hidden
              className="grid size-7 place-items-center rounded-full bg-muted text-metadata font-semibold"
            >
              {user.name.charAt(0)}
            </span>
            {/* Read out at every width, so the link keeps a name when phones show only the initial. */}
            <span className="max-sm:sr-only">{user.name}</span>
            <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-page px-gutter pt-10 pb-24 md:pt-14">{children}</main>
      <ShortcutsHelp />
    </div>
  )
}
