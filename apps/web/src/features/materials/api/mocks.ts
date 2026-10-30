import type { Material } from '../types'

const seed: Material[] = [
  {
    id: 'mat-quote',
    name: 'Quote form',
    fileName: 'quote-form.pdf',
    sizeBytes: 184_320,
    uploadedAt: '2026-10-20T16:00:00Z',
  },
  {
    id: 'mat-po',
    name: 'Purchase order',
    fileName: 'purchase-order.docx',
    sizeBytes: 52_224,
    uploadedAt: '2026-10-20T16:02:00Z',
  },
  {
    id: 'mat-prices',
    name: 'Price list',
    fileName: 'price-list.xlsx',
    sizeBytes: 31_744,
    uploadedAt: '2026-10-20T16:05:00Z',
  },
]

// In-memory "database" so uploads and removals behave realistically during development.
export let mockMaterials: Material[] = structuredClone(seed)
let uploads = 0

export const nextMockMaterialId = () => `mat-upload-${++uploads}`

export function resetMockMaterials() {
  mockMaterials = structuredClone(seed)
  uploads = 0
}
