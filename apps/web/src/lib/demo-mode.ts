import { useSyncExternalStore } from 'react'
import { env } from './env'

// "Try the demo": a visitor uses the app on the built-in sample data without
// signing in. It lasts for this tab (sessionStorage), so a reload keeps it and
// closing the tab ends it. Nothing in demo mode ever calls the real API.
const storageKey = 'demo-mode'
const listeners = new Set<() => void>()
let demo = readStored()

function readStored() {
  try {
    return sessionStorage.getItem(storageKey) === '1'
  } catch {
    return false
  }
}

export function setDemoMode(on: boolean) {
  demo = on
  try {
    if (on) sessionStorage.setItem(storageKey, '1')
    else sessionStorage.removeItem(storageKey)
  } catch {
    // Storage can be unavailable (private mode); the demo then ends on reload.
  }
  for (const listener of listeners) listener()
}

export const isDemoMode = () => demo

/** Re-renders when the demo starts or ends. */
export function useDemoMode() {
  return useSyncExternalStore((listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }, isDemoMode)
}

/** True when API calls answer from the in-memory sample data instead of FastAPI. */
export const mocksEnabled = () => env.VITE_USE_MOCKS || demo
