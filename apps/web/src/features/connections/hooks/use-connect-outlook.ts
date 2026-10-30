import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { connectOutlook } from '../api/connections-api'
import { connectionsKeys } from '../api/queries'

/** Connect or reconnect Outlook. Only the mocks get here on success; real use leaves the page. */
export function useConnectOutlook() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: connectOutlook,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: connectionsKeys.all })
      // Land where Microsoft's redirect would: Settings, with the result.
      await navigate({ to: '/settings', search: { connection: 'connected' } })
    },
  })
}
