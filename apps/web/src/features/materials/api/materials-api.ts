import { ApiError, apiFetch } from '@/lib/api-client'
import { env } from '@/lib/env'
import { mockDelay } from '@/lib/mock'
import type { Material } from '../types'

// Transport only: HTTP calls, or the in-memory mocks when VITE_USE_MOCKS=true.

export async function getMaterials(): Promise<Material[]> {
  if (env.VITE_USE_MOCKS) {
    const { mockMaterials } = await import('./mocks')
    await mockDelay()
    return structuredClone(mockMaterials)
  }
  return apiFetch<Material[]>('/materials')
}

export async function uploadMaterial(file: File): Promise<Material> {
  if (env.VITE_USE_MOCKS) {
    const mocks = await import('./mocks')
    await mockDelay()
    const material: Material = {
      id: mocks.nextMockMaterialId(),
      name: file.name.replace(/\.[^.]+$/, ''),
      fileName: file.name,
      sizeBytes: file.size,
      uploadedAt: new Date().toISOString(),
    }
    mocks.mockMaterials.push(material)
    return structuredClone(material)
  }
  const body = new FormData()
  body.append('file', file)
  return apiFetch<Material>('/materials', { method: 'POST', body })
}

export async function deleteMaterial(id: string): Promise<void> {
  if (env.VITE_USE_MOCKS) {
    const mocks = await import('./mocks')
    await mockDelay()
    const index = mocks.mockMaterials.findIndex((m) => m.id === id)
    if (index === -1) throw new ApiError(404, `Material ${id} not found`)
    mocks.mockMaterials.splice(index, 1)
    return
  }
  return apiFetch<void>(`/materials/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
