import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteMaterial } from '../api/materials-api'
import { materialsKeys } from '../api/queries'

export function useDeleteMaterial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteMaterial,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: materialsKeys.all }),
  })
}
