import type { QueryClient } from '@tanstack/react-query'
import type { AnyRouter } from '@tanstack/react-router'
import { sessionQuery } from '../api/session'

/**
 * The API answered 401: the session cookie expired mid-visit. Forget the cached
 * user so the auth guard agrees, then go to sign-in and come back here afterwards.
 */
export async function expireSession(queryClient: QueryClient, router: AnyRouter) {
  queryClient.setQueryData(sessionQuery().queryKey, null)
  // Several requests can fail at once; only the first should redirect.
  if (router.state.location.pathname === '/sign-in') return
  await router.navigate({
    to: '/sign-in',
    search: { redirect: router.state.location.href },
    replace: true,
  })
}
