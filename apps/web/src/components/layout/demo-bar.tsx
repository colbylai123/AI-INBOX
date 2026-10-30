import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { signInUrl } from '@/features/auth'
import { Button } from '@/components/ui/button'
import { setDemoMode } from '@/lib/demo-mode'

/** Shown on every page during "Try the demo", so nobody mistakes sample mail for theirs. */
export function DemoBar() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const exit = async () => {
    // Leave the app pages first so nothing refetches from the real API, then
    // forget the sample session.
    await navigate({ to: '/' })
    setDemoMode(false)
    queryClient.clear()
  }

  const signIn = () => {
    setDemoMode(false)
    window.location.assign(signInUrl('/inbox'))
  }

  return (
    <div role="region" aria-label="Demo" className="bg-field text-on-field">
      <div className="mx-auto flex max-w-page flex-wrap items-center justify-center gap-x-4 gap-y-2 px-gutter py-2.5 text-sm">
        <p className="text-center">
          <span className="font-semibold">You're trying the demo.</span>{' '}
          <span className="text-on-field-secondary">
            These are sample emails, and nothing you approve is sent.
          </span>
        </p>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={signIn}>
            Sign in to use your inbox
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-on-field-secondary hover:bg-on-field/10 hover:text-on-field"
            onClick={() => void exit()}
          >
            Exit demo
          </Button>
        </div>
      </div>
    </div>
  )
}
