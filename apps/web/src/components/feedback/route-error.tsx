import { useQueryClient, useQueryErrorResetBoundary } from '@tanstack/react-query'
import { type ErrorComponentProps, useNavigate, useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { sessionQuery } from '@/features/auth'
import { isApiError } from '@/lib/api-client'

export function RouteError({ error }: ErrorComponentProps) {
  return isApiError(error, 401) ? <SessionExpired /> : <ErrorMessage error={error} />
}

// The session cookie expired mid-visit. Forget the cached user so the auth guard
// agrees, then go to sign-in and come back here afterwards.
function SessionExpired() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const router = useRouter()
  // Read once: the location changes as soon as we navigate away.
  const [returnTo] = useState(() => router.state.location.href)

  useEffect(() => {
    queryClient.setQueryData(sessionQuery().queryKey, null)
    void navigate({ to: '/sign-in', search: { redirect: returnTo }, replace: true })
  }, [queryClient, navigate, returnTo])

  return null
}

function ErrorMessage({ error }: { error: unknown }) {
  const router = useRouter()
  const queryErrorResetBoundary = useQueryErrorResetBoundary()

  // Clear failed queries so "Try again" refetches instead of rethrowing.
  useEffect(() => {
    queryErrorResetBoundary.reset()
  }, [queryErrorResetBoundary])

  return (
    <div role="alert" className="flex flex-col items-start gap-3 p-8">
      <h1 className="text-lg text-bright">Something went wrong</h1>
      <p className="text-sm text-read">
        {import.meta.env.DEV && error instanceof Error
          ? error.message
          : 'Please try again in a moment.'}
      </p>
      <Button variant="outline" onClick={() => void router.invalidate()}>
        Try again
      </Button>
    </div>
  )
}
