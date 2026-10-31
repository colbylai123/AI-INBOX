import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

function prefersReducedMotion() {
  return typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
}

const bubbles = [
  { className: 'landing-bubble-a', depth: 0.12 },
  { className: 'landing-bubble-b', depth: 0.22 },
  { className: 'landing-bubble-c', depth: 0.08 },
  { className: 'landing-bubble-d', depth: 0.18 },
]

/** Soft violet bubbles that drift up as the page scrolls. With reduced motion they stay put. */
export function ScrollBubbles() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (prefersReducedMotion()) return
    const onScroll = () => {
      const y = window.scrollY
      for (const bubble of node.querySelectorAll<HTMLElement>('[data-depth]')) {
        const depth = Number(bubble.dataset.depth)
        bubble.style.transform = `translate3d(0, ${(-y * depth).toFixed(1)}px, 0)`
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div ref={ref} className="landing-bubbles" aria-hidden="true">
      {bubbles.map((bubble) => (
        <span
          key={bubble.className}
          data-depth={bubble.depth}
          className={cn('landing-bubble', bubble.className)}
        />
      ))}
    </div>
  )
}
