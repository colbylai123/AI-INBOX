import { Badge } from '@/components/ui/badge'
import type { Priority } from '../types'

// High uses the accent color so the most important mail stands out on navy.
const variant = { high: 'default', medium: 'secondary', low: 'outline' } as const

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge variant={variant[priority]}>{priority}</Badge>
}
