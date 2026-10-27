// Placeholder shapes until the FastAPI spec exists (see features/inbox/types.ts).

/** A form, template or reference document the AI can pre-fill or draw on. */
export interface Material {
  id: string
  name: string
  fileName: string
  sizeBytes: number
  uploadedAt: string
}
