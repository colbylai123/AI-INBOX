import { Link } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { Logo } from '@/components/layout/logo'
import { cn } from '@/lib/utils'
import { sections } from '../lib/sections'
import { LiveApproveCard } from './live-approve-card'
import { ArrowPill, DemoPill } from './pills'
import { Reveal } from './reveal'

// Quiet nav type: hover darkens it and draws a thin underline. A press eases out.
const quietLink =
  'rounded-md text-interface font-medium text-[var(--lp-ink-soft)] underline decoration-transparent decoration-1 underline-offset-[6px] transition-[color,text-decoration-color,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-[var(--lp-ink)] hover:decoration-current motion-safe:active:opacity-80'

// These two ease down the page. The others stay ordinary jumps. Either way the browser
// follows the link itself, so keyboard focus moves on to the section as with any link.
const easedSections = new Set(['#how-it-works', '#features'])

function followSection(href: string) {
  if (!easedSections.has(href)) return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  const root = document.documentElement
  root.style.scrollBehavior = 'smooth'
  // Back to ordinary jumps once this one has landed.
  const reset = () => {
    root.style.scrollBehavior = ''
  }
  window.addEventListener('scrollend', reset, { once: true })
  window.setTimeout(reset, 1500)
}

// The field, the white frame and the scene's inset. The header repeats them, so it
// lines up inside the frame while staying outside <main>.
const field = 'mx-auto max-w-[1480px] p-2.5 sm:p-4 lg:p-5'
const frame = 'p-2 sm:p-2.5'
const inset = 'px-4 sm:px-6 lg:px-10'

/** The top of the public page: wordmark and nav laid over the frame. */
export function HeroHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className={field}>
        <div className={frame}>
          <div className={cn('flex items-center gap-3 pt-4 sm:pt-5 min-[880px]:gap-8', inset)}>
            <Link to="/" className="shrink-0 rounded-md">
              <Logo />
            </Link>
            {/* From 880px, where all four fit without wrapping; narrower screens use the menu. */}
            <nav
              aria-label="Page sections"
              className="hidden flex-1 justify-center gap-7 min-[880px]:flex"
            >
              {sections.map(({ href, label }) => (
                <a key={href} href={href} className={quietLink} onClick={() => followSection(href)}>
                  {label}
                </a>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-2 sm:gap-4">
              {/* Phones have no room for it here, so it moves into the menu. */}
              <Link to="/sign-in" className={cn(quietLink, 'max-sm:hidden')}>
                Sign in
              </Link>
              <DemoPill />
              <SectionsMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

/**
 * The white frame and its pastel scene, with the stacked headline, one sentence, the
 * arrow pill and the live approve card over the lower hills.
 */
export function Hero() {
  return (
    <div className={field}>
      <section
        aria-labelledby="hero-heading"
        className={cn(
          'rounded-[32px] bg-[var(--lp-frame)] shadow-[0_1px_2px_rgb(35_29_51/0.06)] sm:rounded-[40px]',
          frame,
        )}
      >
        <div
          className={cn(
            'relative isolate flex flex-col overflow-hidden rounded-[24px] pt-24 pb-6 sm:rounded-[32px] sm:pt-28 sm:pb-8 lg:min-h-[44rem] lg:pt-24 lg:pb-10',
            inset,
          )}
        >
          <Scene />
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <Reveal>
              <p className="mb-5 font-display text-lg text-balance text-[var(--lp-violet-ink)]">
                Mail, but it waits its turn.
              </p>
              {/* Spaces between the lines, so it reads as one sentence. Capped by the
                  window's height too, so on a laptop the sample card below fits on screen. */}
              <h1
                id="hero-heading"
                className="font-display text-[clamp(46px,min(7.5vw,10vh),112px)] leading-[0.94] font-semibold tracking-[-0.05em] text-[var(--lp-ink)]"
              >
                <span className="block">Read it.</span>{' '}
                <span className="block text-[var(--lp-ink-faded)]">Approve it.</span>{' '}
                <span className="block">Then it sends.</span>
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-pretty text-[var(--lp-ink-soft)] sm:text-lg">
                The AI drafts each reply and fills in your forms, and nothing leaves your inbox
                until you have read it and pressed Approve &amp; send.
              </p>
            </Reveal>
            <Reveal delay={200} className="mt-8">
              <ArrowPill />
            </Reveal>
          </div>
          {/* On wide screens it rises beside the pill, over the hills. Only as wide as the card, so it never covers the pill. */}
          <Reveal
            delay={300}
            className="mt-12 w-full max-w-md self-center lg:mt-auto lg:self-end xl:-mt-14"
          >
            {/* The card sits on one organic violet shape over the hills. */}
            <div className="relative">
              <div aria-hidden className="landing-blob" />
              <LiveApproveCard />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}

/** Original CSS and SVG art in the landing palette: lavender sky, fog, purple and gold hills, a warm glow. */
function Scene() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,var(--lp-sky-top)_0%,var(--lp-sky)_40%,var(--lp-fog)_72%)]"
    >
      {/* The warm accent: a low sun behind the far hills. */}
      <div className="absolute bottom-8 left-[64%] size-[32rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,var(--lp-warm)_0%,transparent_62%)]" />
      <svg
        className="absolute inset-x-0 bottom-0 h-[clamp(15rem,44%,24rem)] w-full"
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
      >
        <path
          className="fill-[var(--lp-hill-purple)]"
          opacity="0.8"
          d="M0 150C210 80 400 104 610 158S1030 104 1440 136V400H0Z"
        />
        <path
          className="fill-[var(--lp-hill-gold)]"
          d="M0 246C250 186 520 222 760 254S1190 196 1440 226V400H0Z"
        />
        <path
          className="fill-[var(--lp-hill-deep)]"
          d="M0 302C290 266 560 334 880 310S1250 276 1440 298V400H0Z"
        />
        <path
          className="fill-[var(--lp-hill-gold-deep)]"
          opacity="0.9"
          d="M0 360C350 328 760 372 1080 350S1340 336 1440 348V400H0Z"
        />
      </svg>
      {/* Fog lying over the far hills. */}
      <div className="absolute inset-x-0 bottom-[30%] h-24 bg-[linear-gradient(180deg,transparent,color-mix(in_srgb,var(--lp-fog)_70%,transparent),transparent)] blur-xl" />
    </div>
  )
}

/** Below 880px the section links are hidden, so a menu button opens them instead. */
function SectionsMenu() {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const inside = (target: EventTarget | null) =>
      target instanceof Node && Boolean(rootRef.current?.contains(target))
    // A tap anywhere else on the page closes it.
    const closeOutside = (event: PointerEvent) => {
      if (!inside(event.target)) setOpen(false)
    }
    // Escape closes it wherever focus is, and puts focus back on the button.
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const item =
    'flex h-11 items-center rounded-xl px-3 text-interface font-medium text-[var(--lp-ink-soft)] transition-[color,background-color,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-muted hover:text-[var(--lp-ink)] motion-safe:active:opacity-80'

  return (
    <div
      ref={rootRef}
      className="relative min-[880px]:hidden"
      // Tabbing past the last link closes it, so it never covers the page behind focus.
      onBlur={(event) => {
        if (event.relatedTarget && !rootRef.current?.contains(event.relatedTarget)) {
          setOpen(false)
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label="Page sections"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="grid size-10 place-items-center rounded-full bg-[var(--lp-frame)]/70 text-[var(--lp-ink)] transition-colors hover:bg-[var(--lp-frame)]"
      >
        {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
      </button>
      {open && (
        <nav
          id={panelId}
          aria-label="Page sections"
          className="absolute top-full right-0 mt-2 w-60 rounded-2xl bg-[var(--lp-frame)] p-2 shadow-[0_16px_40px_-16px_rgb(35_29_51/0.35)]"
        >
          <ul className="flex flex-col">
            {sections.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={() => {
                    followSection(href)
                    setOpen(false)
                  }}
                  className={item}
                >
                  {label}
                </a>
              </li>
            ))}
            <li className="sm:hidden">
              <Link to="/sign-in" className={item}>
                Sign in
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  )
}
