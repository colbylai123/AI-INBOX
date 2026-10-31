import { useRouterState } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

const PLAY_MS = 700

/** True when this navigation is the public page opening the inbox. */
function entersInbox(from: string, to: string) {
  const fromPublic = from === '/' || from === '/sign-in' || from === '/demo'
  return fromPublic && to.startsWith('/inbox')
}

/**
 * Plays once as the landing page (or sign-in) gives way to the inbox.
 * The veil starts in the landing lavender and lets the inbox show through.
 */
export function LandingHandoff() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const [from, setFrom] = useState(pathname)
  const [playing, setPlaying] = useState(false)

  if (from !== pathname) {
    setFrom(pathname)
    setPlaying(entersInbox(from, pathname))
  }

  useEffect(() => {
    if (!playing) return
    const id = window.setTimeout(() => setPlaying(false), PLAY_MS)
    return () => window.clearTimeout(id)
  }, [playing])

  if (!playing) return null
  return <div className="landing-handoff" data-handoff="" aria-hidden="true" />
}
