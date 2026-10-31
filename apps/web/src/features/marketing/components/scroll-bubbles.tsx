import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

function prefersReducedMotion() {
  return typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
}

const bubbles = [
  { className: 'landing-bubble-a', depth: 0.04 },
  { className: 'landing-bubble-b', depth: 0.07 },
  { className: 'landing-bubble-c', depth: 0.03 },
  { className: 'landing-bubble-d', depth: 0.05 },
]

/** Soft violet bubbles that drift up as the page scrolls. With reduced motion they stay put. */
export function ScrollBubbles() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (prefersReducedMotion()) return
    const items = [...node.querySelectorAll<HTMLElement>('[data-depth]')]
    let target = window.scrollY
    let current = target
    let frame = 0
    const tick = () => {
      current += (target - current) * 0.08
      if (Math.abs(target - current) < 0.3) current = target
      for (const bubble of items) {
        const depth = Number(bubble.dataset.depth)
        bubble.style.transform = `translate3d(0, ${(-current * depth).toFixed(1)}px, 0)`
      }
      frame = current === target ? 0 : window.requestAnimationFrame(tick)
    }
    const onScroll = () => {
      target = window.scrollY
      if (!frame) frame = window.requestAnimationFrame(tick)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
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
