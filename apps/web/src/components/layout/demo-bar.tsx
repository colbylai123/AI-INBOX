import { signInUrl, useSignOut } from '@/features/auth'
import { Button } from '@/components/ui/button'
import { setDemoMode } from '@/lib/demo-mode'

/** Shown on every page during "Try the demo", so nobody mistakes sample mail for theirs. */
export function DemoBar() {
  // In the demo, signing out means leaving it for the landing page.
  const exit = useSignOut()

  const signIn = () => {
    setDemoMode(false)
    window.location.assign(signInUrl('/inbox'))
  }

  return (
    <div
      role="region"
      aria-label="Demo"
      className="border-b border-border bg-card text-foreground"
    >
      <div className="mx-auto flex max-w-page flex-wrap items-center justify-center gap-x-4 gap-y-2 px-gutter py-2.5 text-sm">
        <p className="text-center">
          <span className="font-medium">You’re trying the demo.</span>{' '}
          <span className="text-muted-foreground">
            These are sample emails, and nothing you approve is sent.
          </span>
        </p>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={signIn}>
            Sign in to use your inbox
          </Button>
          <Button size="sm" variant="ghost" disabled={exit.isPending} onClick={() => exit.mutate()}>
            Exit demo
          </Button>
        </div>
      </div>
    </div>
  )
}
