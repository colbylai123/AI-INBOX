import type { WeeklyStats } from '../types'

// Rough minutes a person spends on each by hand. Shown next to the total, so the
// estimate is honest about where it comes from. Tune these as real usage comes in.
export const minutesPerReply = 4
export const minutesPerForm = 6

export function minutesSaved(stats: WeeklyStats): number {
  return stats.draftsApproved * minutesPerReply + stats.formsApproved * minutesPerForm
}

/** "10 min", "1 h", "2 h 10 min". */
export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} min`
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`
}
