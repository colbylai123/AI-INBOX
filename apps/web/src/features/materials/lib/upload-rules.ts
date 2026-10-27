// What the Materials page accepts. Keep in sync with the backend's upload limits.
export const acceptedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'] as const
export const maxUploadBytes = 20 * 1024 * 1024

/** Returns a message for the user when the file can't be uploaded, otherwise null. */
export function uploadProblem(file: File): string | null {
  const name = file.name.toLowerCase()
  if (!acceptedExtensions.some((ext) => name.endsWith(ext))) {
    return `${file.name} isn't a PDF, Word or Excel file.`
  }
  if (file.size > maxUploadBytes) {
    return `${file.name} is larger than ${formatBytes(maxUploadBytes)}.`
  }
  return null
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${Number((bytes / (1024 * 1024)).toFixed(1))} MB`
}
