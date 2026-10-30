import { useMutation, useQueryClient } from '@tanstack/react-query'
import { disconnect } from '../api/connections-api'
import { connectionsKeys } from '../api/queries'

export function useDisconnect() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: disconnect,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: connectionsKeys.all }),
  })
}
