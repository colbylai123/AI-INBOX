import { Badge } from '@/components/ui/badge'
import type { Priority } from '../types'

const variant = { high: 'destructive', medium: 'secondary', low: 'outline' } as const

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge variant={variant[priority]}>{priority}</Badge>
}
