import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { connect } from '../api/connections-api'
import { connectionsKeys } from '../api/queries'
import type { Provider } from '../types'

/** Connect or reconnect an account. Only the mocks get here on success; real use leaves the page. */
export function useConnect(provider: Provider, connectionId?: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: () => connect(provider, connectionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: connectionsKeys.all })
      // Land where the provider's redirect would: Settings, with the result.
      await navigate({ to: '/settings', search: { provider, connection: 'connected' } })
    },
  })
}
