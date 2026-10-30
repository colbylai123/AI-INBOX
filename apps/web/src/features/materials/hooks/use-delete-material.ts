import { useMutation, useMutationState, useQueryClient } from '@tanstack/react-query'
import { deleteMaterial } from '../api/materials-api'
import { materialsKeys } from '../api/queries'

export function useDeleteMaterial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: materialsKeys.remove(),
    mutationFn: deleteMaterial,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: materialsKeys.all }),
  })
}

/**
 * Ids of every material whose removal is still in flight. A single mutation only
 * reports its latest call, so two quick removals would re-enable the first row.
 */
export function useRemovingMaterialIds() {
  return useMutationState({
    filters: { mutationKey: materialsKeys.remove(), status: 'pending' },
    select: (mutation) => mutation.state.variables as string,
  })
}
