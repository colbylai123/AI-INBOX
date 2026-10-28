import { Badge } from '@/components/ui/badge'
import type { Priority } from '../types'

// High is the one dark mark, so the most important mail stands out. Blue stays
// reserved for actions and selected states.
const variant = { high: 'default', medium: 'secondary', low: 'outline' } as const

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge variant={variant[priority]}>{priority}</Badge>
}
