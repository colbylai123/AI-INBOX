import { useSyncExternalStore } from 'react'

// Light or dark, remembered in this browser. index.html reads the same key before
// the first paint, so a dark choice never flashes light while the app loads.
export type Theme = 'light' | 'dark'

const storageKey = 'theme'
const themeColors: Record<Theme, string> = { light: '#fcfcfd', dark: '#0e131b' }
const listeners = new Set<() => void>()
let theme = readStored()

function readStored(): Theme {
  try {
    return localStorage.getItem(storageKey) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

/** Sets data-theme on <html>, which the color tokens in globals.css follow. */
function apply() {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColors[theme])
}

export function setTheme(next: Theme) {
  theme = next
  try {
    localStorage.setItem(storageKey, next)
  } catch {
    // Storage can be unavailable (private mode); the choice then lasts for this visit.
  }
  apply()
  for (const listener of listeners) listener()
}

export const getTheme = () => theme

/** Re-renders when the theme changes, here or in another tab. */
export function useTheme() {
  return useSyncExternalStore((listener) => {
    listeners.add(listener)
    const fromOtherTab = (event: StorageEvent) => {
      if (event.key !== storageKey) return
      theme = readStored()
      apply()
      listener()
    }
    window.addEventListener('storage', fromOtherTab)
    return () => {
      listeners.delete(listener)
      window.removeEventListener('storage', fromOtherTab)
    }
  }, getTheme)
}

/** Applies the remembered theme. main.tsx calls it once, before the first render. */
export function applyStoredTheme() {
  theme = readStored()
  apply()
}
