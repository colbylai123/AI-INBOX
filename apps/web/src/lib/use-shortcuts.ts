import { useEffect } from 'react'

/** True when the keystroke belongs to a field the user is typing in. */
function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  )
}

/**
 * Single-key shortcuts, keyed by KeyboardEvent.key ("j", "?", "Escape"). They
 * never fire while the user is typing in a field, with Ctrl, Cmd or Alt held,
 * or when something else already handled the key (preventDefault).
 */
export function useShortcuts(shortcuts: Record<string, () => void>, enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return
      if (isTyping(event.target)) return
      const run = shortcuts[event.key]
      if (!run) return
      event.preventDefault()
      run()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [shortcuts, enabled])
}
