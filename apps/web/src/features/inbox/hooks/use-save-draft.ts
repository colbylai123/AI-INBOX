import { useMutation, useQueryClient } from '@tanstack/react-query'
import { saveDraft } from '../api/inbox-api'
import { inboxKeys } from '../api/queries'
import type { DraftUpdate } from '../types'

export function useSaveDraft(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (update: DraftUpdate) => saveDraft(id, update),
    onSuccess: (message) => queryClient.setQueryData(inboxKeys.detail(id), message),
  })
}
