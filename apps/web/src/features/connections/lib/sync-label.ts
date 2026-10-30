import type { Connection } from '../types'

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

/** "Synced 2 minutes ago", or "Waiting for the first sync". */
export function syncLabel(connection: Connection, now = Date.now()): string {
  if (!connection.lastSyncedAt) return 'Waiting for the first sync'
  const minutes = Math.round((Date.parse(connection.lastSyncedAt) - now) / 60_000)
  if (minutes > -1) return 'Synced just now'
  if (minutes > -60) return `Synced ${relative.format(minutes, 'minute')}`
  const hours = Math.round(minutes / 60)
  if (hours > -24) return `Synced ${relative.format(hours, 'hour')}`
  return `Synced ${relative.format(Math.round(hours / 24), 'day')}`
}
