import { useQueryClient, useQueryErrorResetBoundary } from '@tanstack/react-query'
import { type ErrorComponentProps, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { expireSession } from '@/features/auth'
import { isApiError } from '@/lib/api-client'

export function RouteError({ error }: ErrorComponentProps) {
  return isApiError(error, 401) ? <SessionExpired /> : <ErrorMessage error={error} />
}

// A loader or page got a 401. Mutations are covered in <App>.
function SessionExpired() {
  const queryClient = useQueryClient()
  const router = useRouter()

  useEffect(() => {
    void expireSession(queryClient, router)
  }, [queryClient, router])

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
      <h1 className="font-display text-lg font-bold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">
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
