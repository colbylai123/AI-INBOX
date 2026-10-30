import { Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useUploadMaterial } from '../hooks/use-upload-material'
import { acceptedExtensions, uploadProblem } from '../lib/upload-rules'

/** Picks a file, checks it against the upload rules, then uploads it. */
export function UploadButton() {
  const input = useRef<HTMLInputElement>(null)
  const upload = useUploadMaterial()
  const [problem, setProblem] = useState<string | null>(null)

  function handleFile(file: File | undefined) {
    if (!file) return
    const reason = uploadProblem(file)
    setProblem(reason)
    if (!reason) upload.mutate(file)
  }

  const error = problem ?? (upload.isError ? "Couldn't upload. Please try again." : null)

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <input
        ref={input}
        type="file"
        accept={acceptedExtensions.join(',')}
        aria-label="Choose a file to upload"
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          handleFile(event.currentTarget.files?.[0])
          // Clear it so picking the same file again still fires onChange.
          event.currentTarget.value = ''
        }}
      />
      <Button onClick={() => input.current?.click()} disabled={upload.isPending}>
        <Upload /> {upload.isPending ? 'Uploading…' : 'Upload'}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
