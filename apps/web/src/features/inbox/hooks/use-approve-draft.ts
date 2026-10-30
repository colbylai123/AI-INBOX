import { useMutation, useQueryClient } from '@tanstack/react-query'
import { approveDraft } from '../api/inbox-api'
import { inboxKeys } from '../api/queries'

export function useApproveDraft() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: approveDraft,
    // Returned, so a send only counts as done once the inbox has refetched.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inboxKeys.all }),
  })
}
