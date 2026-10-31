import { type FocusEvent, useEffect, useRef, useState } from 'react'

/**
 * A button that opens a small panel: a menu, the inbox filters, a toggletip. The
 * panel closes on Escape (focus goes back to the button), on a tap outside it, and
 * when focus moves away from both.
 */
export function useDisclosure() {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const inside = (node: Node | null) =>
    !!node && (!!buttonRef.current?.contains(node) || !!panelRef.current?.contains(node))

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!inside(event.target as Node)) setOpen(false)
    }
    // On the document, so it runs before the page's own Escape shortcut and stops it.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return
      event.preventDefault()
      setOpen(false)
      buttonRef.current?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  })

  return {
    open,
    setOpen,
    toggle: () => setOpen((was) => !was),
    buttonRef,
    panelRef,
    /** On the wrapper of both, so tabbing out closes the panel. */
    onBlur: (event: FocusEvent) => {
      if (event.relatedTarget && !inside(event.relatedTarget as Node)) setOpen(false)
    },
  }
}
