import { useMutation, useQueryClient } from '@tanstack/react-query'
import { disconnect } from '../api/connections-api'
import { connectionsKeys } from '../api/queries'

/**
 * One account's disconnect, so each row keeps its own pending and error state.
 * `onDisconnected` runs once the refreshed list no longer has the account. It's
 * set here, not on mutate, because the account's row has unmounted by then.
 */
export function useDisconnect(onDisconnected?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: disconnect,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: connectionsKeys.all })
      onDisconnected?.()
    },
  })
}
