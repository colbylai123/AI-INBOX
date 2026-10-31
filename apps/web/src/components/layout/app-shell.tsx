import { Link, useRouterState } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import type { User } from '@/features/auth'
import { useDemoMode } from '@/lib/demo-mode'
import { env } from '@/lib/env'
import { buttonVariants } from '@/components/ui/button'
import { AccountLink } from './account-link'
import { AppRail } from './app-rail'
import { DemoBar } from './demo-bar'
import { DismissibleBanner } from './dismissible-banner'
import { ShortcutsHelp } from './shortcuts-help'
import { ThemePill } from './theme-toggle'
import { WindowBar } from './window-bar'

function surfaceFor(pathname: string) {
  if (pathname.startsWith('/materials')) return 'materials'
  if (pathname.startsWith('/settings')) return 'settings'
  return 'inbox'
}

export function AppShell({ user, children }: { user: User; children: ReactNode }) {
  const demo = useDemoMode()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const surface = surfaceFor(pathname)
  return (
    // The field. On wide screens the app sits on it as one rounded window.
    <div className="flex min-h-svh flex-col lg:p-5 print:p-0" data-surface={surface}>
      {/* On wide screens these sit on the field above the window, rounded like it. */}
      <div className="empty:hidden lg:mx-auto lg:mb-3 lg:w-full lg:max-w-[1600px] lg:overflow-hidden lg:rounded-2xl print:hidden">
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
      </div>

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col bg-canvas lg:rounded-[28px] lg:border lg:border-card-edge print:border-0">
        {/* In print only the page itself shows, not the app around it. */}
        <header className="print:hidden">
          <WindowBar />
        </header>
        {/* Phones: the rail and the theme and account controls share the top row, and
            the page goes under them. Wide screens: the rail is a column at the left. */}
        <div className="grid flex-1 grid-cols-[1fr_auto] content-start lg:grid-cols-[auto_1fr] lg:grid-rows-[auto_1fr]">
          <AppRail className="lg:row-span-2 print:hidden" />
          {/* The inbox has them at the end of its folder chips, as in the reference. */}
          {surface !== 'inbox' && (
            <section
              aria-label="Theme and account"
              className="flex items-center justify-end gap-2 pr-3 pb-3 sm:pr-4 lg:pt-2 lg:pr-5 print:hidden"
            >
              <ThemePill />
              <AccountLink user={user} />
            </section>
          )}
          <main className="col-span-2 min-w-0 px-3 pb-6 sm:px-4 lg:col-span-1 lg:pt-2 lg:pr-5 lg:pb-5 lg:pl-1">
            {children}
          </main>
        </div>
      </div>
      <ShortcutsHelp />
    </div>
  )
}
