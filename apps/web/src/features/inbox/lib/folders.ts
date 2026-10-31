import type { MessageSummary } from '../types'
import { type LocalFolders, placeOf } from './local-folders'

/** The folder chips, in order. The inbox is the default, so it has no id in the URL. */
export const folders = [
  'sent',
  'drafts',
  'favorites',
  'archive',
  'deleted',
  'spam',
  'junk',
] as const
export type Folder = (typeof folders)[number]

export const folderNames: Record<Folder | 'inbox', string> = {
  inbox: 'Inbox',
  sent: 'Sent items',
  drafts: 'Drafts',
  favorites: 'Favorites',
  archive: 'Archive',
  deleted: 'Deleted',
  spam: 'Spam',
  junk: 'Junk',
}

/**
 * The emails a folder holds. Sent items are approved replies and Drafts are drafts
 * still waiting for approval. Favorites, Archive and Deleted are kept in this browser
 * (see local-folders.ts). Nothing marks spam or junk yet, so those stay empty.
 */
export function inFolder(
  messages: MessageSummary[],
  folder: Folder | undefined,
  local: LocalFolders,
) {
  switch (folder) {
    case undefined:
      return messages.filter((m) => !placeOf(local, m.id))
    case 'sent':
      return messages.filter((m) => m.approvedAt)
    case 'drafts':
      return messages.filter((m) => m.hasDraft && !m.approvedAt && !placeOf(local, m.id))
    case 'favorites':
      return messages.filter((m) => local.starred.includes(m.id))
    case 'archive':
      return messages.filter((m) => placeOf(local, m.id) === 'archived')
    case 'deleted':
      return messages.filter((m) => placeOf(local, m.id) === 'deleted')
    case 'spam':
    case 'junk':
      return []
  }
}
