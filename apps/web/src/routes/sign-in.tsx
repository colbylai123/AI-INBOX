import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { sessionQuery, signInUrl } from '@/features/auth'

export const Route = createFileRoute('/sign-in')({
  validateSearch: z.object({
    // Only allow same-site paths, so the link can't bounce users to another site.
    redirect: z
      .string()
      .regex(/^\/(?!\/)/)
      .optional()
      .catch(undefined),
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
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in to AI Inbox</CardTitle>
          <CardDescription>Use your work account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            onClick={() => {
              window.location.assign(signInUrl(returnTo ?? '/inbox'))
            }}
          >
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
