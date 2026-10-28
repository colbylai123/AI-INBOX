import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadMaterial } from '../api/materials-api'
import { materialsKeys } from '../api/queries'

export function useUploadMaterial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: uploadMaterial,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: materialsKeys.all }),
  })
}
