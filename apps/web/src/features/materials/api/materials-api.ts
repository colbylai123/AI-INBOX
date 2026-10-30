import { ApiError, apiFetch } from '@/lib/api-client'
import { mocksEnabled } from '@/lib/demo-mode'
import { mockDelay } from '@/lib/mock'
import type { Material } from '../types'

// Transport only: HTTP calls, or the in-memory mocks in development and in the demo.

export async function getMaterials(): Promise<Material[]> {
  if (mocksEnabled()) {
    const { mockMaterials } = await import('./mocks')
    await mockDelay()
    return structuredClone(mockMaterials)
  }
  return apiFetch<Material[]>('/materials')
}

export async function uploadMaterial(file: File): Promise<Material> {
  if (mocksEnabled()) {
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
  if (mocksEnabled()) {
    const mocks = await import('./mocks')
    await mockDelay()
    const index = mocks.mockMaterials.findIndex((m) => m.id === id)
    if (index === -1) throw new ApiError(404, `Material ${id} not found`)
    mocks.mockMaterials.splice(index, 1)
    return
  }
  return apiFetch<void>(`/materials/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

/** Puts the sample materials back to how they started, so each demo begins fresh. */
export async function resetSampleMaterials(): Promise<void> {
  const { resetMockMaterials } = await import('./mocks')
  resetMockMaterials()
}
