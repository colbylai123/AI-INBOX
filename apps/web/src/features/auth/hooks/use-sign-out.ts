import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { isDemoMode, setDemoMode } from '@/lib/demo-mode'
import { sessionQuery, signOut } from '../api/session'

// So other features can tell a sign-out is under way (held replies are dropped at once).
export const signOutKey = ['sign-out'] as const

/** Sign out, or leave the demo: back to sign-in (or the landing page) with nothing cached. */
export function useSignOut() {
  const queryClient = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationKey: signOutKey,
    mutationFn: async () => {
      if (!isDemoMode()) await signOut()
    },
    onSuccess: async () => {
      const demo = isDemoMode()
      // Forget the user first, so the sign-in page doesn't bounce back to the inbox.
      if (!demo) queryClient.setQueryData(sessionQuery().queryKey, null)
      // Leave the signed-in pages before clearing, so nothing refetches with the old session.
      await router.navigate({ to: demo ? '/' : '/sign-in', replace: true })
      setDemoMode(false)
      queryClient.clear()
    },
  })
}
