import { queryOptions } from '@tanstack/react-query'
import { apiFetch, isApiError } from '@/lib/api-client'
import { env } from '@/lib/env'
import type { User } from '../types'

// Login is WorkOS AuthKit, verified by FastAPI. The browser only asks FastAPI
// "who am I?"; it never sees WorkOS or Microsoft tokens.
async function fetchSession(): Promise<User | null> {
  if (env.VITE_USE_MOCKS) {
    return { id: 'u1', name: 'Demo User', email: 'demo@example.com' }
  }
  try {
    return await apiFetch<User>('/auth/me')
  } catch (error) {
    if (isApiError(error, 401)) return null
    throw error
  }
}

export const sessionQuery = () =>
  queryOptions({ queryKey: ['session'], queryFn: fetchSession, staleTime: 5 * 60_000 })

/** Where the sign-in button sends the browser. FastAPI redirects to WorkOS. */
export const signInUrl = (returnTo: string) =>
  `${env.VITE_API_URL}/auth/login?return_to=${encodeURIComponent(returnTo)}`
