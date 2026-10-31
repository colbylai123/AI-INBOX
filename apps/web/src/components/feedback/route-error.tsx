import { useQueryClient, useQueryErrorResetBoundary } from '@tanstack/react-query'
import { type ErrorComponentProps, useRouter } from '@tanstack/react-router'
import { type ReactNode, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { expireSession } from '@/features/auth'
import { isApiError } from '@/lib/api-client'

type Wording = {
  /** The heading. Defaults to "Something went wrong". */
  title?: string
  /** The line under it. Defaults to "Please try again in a moment." */
  description?: string
  /** More ways on, shown beside Try again. */
  actions?: ReactNode
}

export function RouteError({ error, ...wording }: ErrorComponentProps & Wording) {
  return isApiError(error, 401) ? <SessionExpired /> : <ErrorMessage error={error} {...wording} />
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

function ErrorMessage({
  error,
  title = 'Something went wrong',
  description = 'Please try again in a moment.',
  actions,
}: { error: unknown } & Wording) {
  const router = useRouter()
  const queryErrorResetBoundary = useQueryErrorResetBoundary()

  // Clear failed queries so "Try again" refetches instead of rethrowing.
  useEffect(() => {
    queryErrorResetBoundary.reset()
  }, [queryErrorResetBoundary])

  return (
    <div role="alert" className="flex flex-col items-start gap-3 p-8">
      <h1 className="font-display text-lg font-bold">{title}</h1>
      <p className="max-w-prose text-sm text-muted-foreground">
        {import.meta.env.DEV && error instanceof Error ? error.message : description}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={() => void router.invalidate()}>
          Try again
        </Button>
        {actions}
      </div>
    </div>
  )
}
