import { useMutation, useQueryClient } from '@tanstack/react-query'
import { approveDraft } from '../api/inbox-api'
import { inboxKeys } from '../api/queries'

export function useApproveDraft() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: approveDraft,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inboxKeys.all }),
  })
}
