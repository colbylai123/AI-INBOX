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
    <div className="mx-auto flex min-h-svh max-w-6xl flex-col px-4 md:px-8">
      <header className="py-5 md:py-7">
        <Logo />
      </header>
      <main className="grid flex-1 items-center gap-12 pb-16 md:grid-cols-[1.1fr_1fr] md:gap-8">
        <div>
          <h1 className="text-5xl leading-[1.05] font-bold tracking-tight text-balance md:text-7xl">
            Your inbox, sorted and drafted
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground md:text-xl md:leading-relaxed">
            AI ranks incoming mail by importance and drafts the reply. You review and approve before
            anything is sent.
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
            <span className="text-sm text-muted-foreground">Use your work account.</span>
          </div>
        </div>
        <SignInPreview />
      </main>
    </div>
  )
}
