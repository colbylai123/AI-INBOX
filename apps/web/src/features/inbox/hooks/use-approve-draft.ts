import { useMutation, useQueryClient } from '@tanstack/react-query'
import { approveDraft } from '../api/inbox-api'
import { inboxKeys } from '../api/queries'
import type { Message } from '../types'

export function useApproveDraft() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: approveDraft,
    onSuccess: (_, id) => {
      // The draft page may not be open, and invalidating only refetches open pages,
      // so mark its cached copy approved now. Going back never offers Approve again.
      queryClient.setQueryData<Message>(
        inboxKeys.detail(id),
        (message) =>
          message && { ...message, approvedAt: message.approvedAt ?? new Date().toISOString() },
      )
      // Returned, so a send only counts as done once the open pages have refetched.
      return queryClient.invalidateQueries({ queryKey: inboxKeys.all })
    },
  })
}
