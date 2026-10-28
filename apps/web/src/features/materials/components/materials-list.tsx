import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDeleteMaterial } from '../hooks/use-delete-material'
import { formatBytes } from '../lib/upload-rules'
import type { Material } from '../types'

const uploadedOn = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })

export function MaterialsList({ materials }: { materials: Material[] }) {
  const remove = useDeleteMaterial()

  return (
    <div className="flex flex-col gap-3">
      <ul className="divide-y divide-hairline overflow-hidden rounded-lg border border-hairline bg-panel">
        {materials.map((m) => (
          <li key={m.id} className="flex items-center gap-4 px-5 py-4">
            <FileText className="size-4 shrink-0 text-meta" aria-hidden />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate text-bright">{m.name}</span>
              <span className="font-mono text-xs text-meta">
                {m.fileName} · {formatBytes(m.sizeBytes)} ·{' '}
                {uploadedOn.format(new Date(m.uploadedAt))}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Remove ${m.name}`}
              disabled={remove.isPending && remove.variables === m.id}
              onClick={() => remove.mutate(m.id)}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
      {remove.isError && (
        <p role="alert" className="text-sm text-destructive">
          Couldn't remove that file. Please try again.
        </p>
      )}
    </div>
  )
}
