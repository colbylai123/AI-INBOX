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
    <div className="relative min-h-svh overflow-hidden">
      {/* Static pools of white light across the opening field. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 size-[44rem] opacity-60 light-pool"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 -right-24 size-[40rem] light-pool"
      />

      <div className="relative mx-auto flex min-h-svh max-w-page flex-col px-gutter">
        <header className="border-b border-hairline py-4 md:py-5">
          <Logo />
        </header>
        <main className="grid flex-1 content-center items-center gap-12 py-16 lg:grid-cols-12 lg:gap-6">
          <div className="min-w-0 lg:col-span-7">
            <h1 className="text-[clamp(44px,7.4vw,104px)] leading-[0.98] font-normal tracking-[-0.04em] text-balance text-bright">
              Your inbox, sorted and drafted
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed md:text-xl">
              <span className="text-bright">
                AI ranks incoming mail by importance, drafts the reply and fills in your forms.
              </span>{' '}
              <span className="text-read">You review and approve before anything is sent.</span>
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                onClick={() => {
                  window.location.assign(signInUrl(returnTo ?? '/inbox'))
                }}
              >
                Sign in <ChevronRight />
              </Button>
              <span className="font-mono text-xs text-meta">Use your work account.</span>
            </div>
          </div>
          <div className="min-w-0 lg:col-span-5">
            <SignInPreview />
          </div>
        </main>
      </div>
    </div>
  )
}
