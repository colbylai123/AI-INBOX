import { useSyncExternalStore } from 'react'
import { isDemoMode } from '@/lib/demo-mode'

/**
 * Stars, Archive and Deleted kept in this browser only. The API has no fields for
 * them, so moving an email here hides it from the inbox list on this device and
 * changes nothing in the mailbox itself.
 */
export type LocalFolders = { starred: string[]; archived: string[]; deleted: string[] }
export type LocalPlace = 'archived' | 'deleted'

// The demo keeps its own, for this tab, so starting it never touches a real inbox's.
const storageKey = 'inbox:local-folders'
const demoKey = 'inbox:demo-folders'
const store = () =>
  isDemoMode()
    ? { storage: sessionStorage, key: demoKey }
    : { storage: localStorage, key: storageKey }
const empty: LocalFolders = { starred: [], archived: [], deleted: [] }
const listeners = new Set<() => void>()
let cachedKey = ''
let cachedRaw: string | null = null
let cached: LocalFolders = empty

function read(): LocalFolders {
  let raw: string | null = null
  let key = ''
  try {
    const { storage, key: current } = store()
    key = current
    raw = storage.getItem(key)
  } catch {
    // Storage can be unavailable (private mode); the folders then last for this visit.
    return cached
  }
  if (key === cachedKey && raw === cachedRaw) return cached
  cachedKey = key
  cachedRaw = raw
  try {
    const parsed = raw ? (JSON.parse(raw) as Partial<LocalFolders>) : {}
    const ids = (value: unknown) =>
      Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : []
    cached = {
      starred: ids(parsed.starred),
      archived: ids(parsed.archived),
      deleted: ids(parsed.deleted),
    }
  } catch {
    cached = empty
  }
  return cached
}

function write(next: LocalFolders) {
  cached = next
  try {
    const { storage, key } = store()
    cachedKey = key
    cachedRaw = JSON.stringify(next)
    storage.setItem(key, cachedRaw)
  } catch {
    cachedRaw = null
  }
  for (const listener of listeners) listener()
}

const without = (ids: string[], id: string) => ids.filter((other) => other !== id)

export function toggleStar(id: string) {
  const folders = read()
  write({
    ...folders,
    starred: folders.starred.includes(id) ? without(folders.starred, id) : [...folders.starred, id],
  })
}

/** Moves an email to Archive or Deleted in this browser, or back to the inbox (null). */
export function moveTo(id: string, place: LocalPlace | null) {
  const folders = read()
  const archived = without(folders.archived, id)
  const deleted = without(folders.deleted, id)
  write({
    ...folders,
    archived: place === 'archived' ? [...archived, id] : archived,
    deleted: place === 'deleted' ? [...deleted, id] : deleted,
  })
}

/** Forgets every star and move in the current store, as when a fresh demo starts. */
export function resetLocalFolders() {
  write(empty)
}

export function placeOf(folders: LocalFolders, id: string): LocalPlace | null {
  if (folders.deleted.includes(id)) return 'deleted'
  if (folders.archived.includes(id)) return 'archived'
  return null
}

export function useLocalFolders() {
  return useSyncExternalStore((listener) => {
    listeners.add(listener)
    const fromOtherTab = (event: StorageEvent) => {
      if (event.key === storageKey) listener()
    }
    window.addEventListener('storage', fromOtherTab)
    return () => {
      listeners.delete(listener)
      window.removeEventListener('storage', fromOtherTab)
    }
  }, read)
}
