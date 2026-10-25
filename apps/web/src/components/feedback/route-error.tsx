import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { type ErrorComponentProps, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export function RouteError({ error }: ErrorComponentProps) {
  const router = useRouter()
  const queryErrorResetBoundary = useQueryErrorResetBoundary()

  // Clear failed queries so "Try again" refetches instead of rethrowing.
  useEffect(() => {
    queryErrorResetBoundary.reset()
  }, [queryErrorResetBoundary])

  return (
    <div role="alert" className="flex flex-col items-start gap-3 p-8">
      <h1 className="text-lg font-semibold">Something went wrong</h1>
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
