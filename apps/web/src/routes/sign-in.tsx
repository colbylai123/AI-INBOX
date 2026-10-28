import { createFileRoute, redirect } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/layout/logo'
import { SignInPreview, sessionQuery, signInUrl } from '@/features/auth'
import { isSafeRedirectPath } from '@/lib/safe-redirect'

export const Route = createFileRoute('/sign-in')({
  validateSearch: z.object({
    // Only allow paths on this app, so the link can't bounce users to another site.
    redirect: z.string().refine(isSafeRedirectPath).optional().catch(undefined),
  }),
  beforeLoad: async ({ context, search }) => {
    const user = await context.queryClient.ensureQueryData(sessionQuery())
    if (user) throw redirect({ to: search.redirect ?? '/inbox' })
  },
  component: SignIn,
})

function SignIn() {
  const { redirect: returnTo } = Route.useSearch()
  return (
    <div className="min-h-svh">
      <div className="mx-auto flex min-h-svh max-w-page flex-col px-gutter">
        <header className="border-b border-border py-4 md:py-5">
          <Logo />
        </header>
        {/* Hero split about 1.45 : 1, copy first, stacked below 1050px. */}
        <main className="grid flex-1 content-center items-center gap-12 py-16 lg:grid-cols-[1.45fr_1fr] lg:gap-16">
          <div className="min-w-0">
            <h1 className="font-display text-[clamp(40px,6.4vw,84px)] leading-[1.02] font-bold tracking-[-0.03em] text-balance">
              Your inbox, sorted and drafted
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed md:text-xl">
              AI ranks incoming mail by importance, drafts the reply and fills in your forms.{' '}
              <span className="text-muted-foreground">
                You review and approve before anything is sent.
              </span>
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                onClick={() => {
                  window.location.assign(signInUrl(returnTo ?? '/inbox'))
                }}
              >
                Sign in <ChevronRight />
              </Button>
              <span className="text-metadata text-muted-foreground">Use your work account.</span>
            </div>
          </div>
          <div className="min-w-0">
            <SignInPreview />
          </div>
        </main>
      </div>
    </div>
  )
}
