import { Badge } from '@/components/ui/badge'
import type { Priority } from '../types'

// High is the one bright mark, so the most important mail stands out.
const variant = { high: 'default', medium: 'secondary', low: 'outline' } as const

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge variant={variant[priority]}>{priority}</Badge>
}
