import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { z } from 'zod/mini'
import { Notice } from '@/components/feedback/notice'
import { Button } from '@/components/ui/button'
import { sessionQuery, signInUrl } from '@/features/auth'
import { SiteHeader } from '@/features/marketing'
import { isDemoMode, setDemoMode } from '@/lib/demo-mode'
import { isSafeRedirectPath } from '@/lib/safe-redirect'

export const Route = createFileRoute('/sign-in')({
  validateSearch: z.object({
    // Only allow paths on this app, so the link can't bounce users to another site.
    redirect: z.catch(z.optional(z.string().check(z.refine(isSafeRedirectPath))), undefined),
  }),
  beforeLoad: async ({ context, search, preload }) => {
    // Going to sign in ends a demo, so the sample user can't stand in for a real one.
    if (isDemoMode() && !preload) {
      setDemoMode(false)
      context.queryClient.clear()
    }
    // A server that can't be reached doesn't hide the page, which also offers the demo.
    const user = await context.queryClient.ensureQueryData(sessionQuery()).catch(() => undefined)
    if (user) throw redirect({ to: search.redirect ?? '/inbox' })
    return { unreachable: user === undefined }
  },
  component: SignIn,
})

function SignIn() {
  const { redirect: returnTo } = Route.useSearch()
  const { unreachable } = Route.useRouteContext()
  return (
    <div className="flex min-h-svh flex-col" data-surface="sign-in">
      <SiteHeader />
      <main className="grid flex-1 place-items-center px-gutter py-16">
        <div className="w-full max-w-md rounded-lg border border-card-edge bg-card p-8 shadow-panel md:p-10">
          <h1 className="font-display text-2xl leading-tight font-semibold tracking-[-0.02em]">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Use your work account to open your inbox.
          </p>
          {unreachable && (
            <Notice tone="error" className="mt-6">
              Signing in isn't available right now. Try again in a moment, or try the demo below.
            </Notice>
          )}
          <Button
            size="lg"
            className="mt-8 w-full"
            onClick={() => {
              window.location.assign(signInUrl(returnTo ?? '/inbox'))
            }}
          >
            Sign in <ChevronRight />
          </Button>
          <p className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">
            New here?{' '}
            <Link
              to="/demo"
              preload={false}
              className="rounded-sm font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
            >
              Try the demo with sample emails
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
