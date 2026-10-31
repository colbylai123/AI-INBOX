import { Link } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { Logo } from '@/components/layout/logo'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const sections = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#control', label: 'Your control' },
  { href: '#faq', label: 'FAQ' },
]

/** Header for the public pages. The landing page also links to its own sections. */
export function SiteHeader({ page }: { page: 'landing' | 'sign-in' }) {
  return (
    <header className="sticky top-0 z-10 border-b border-border/80 bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-page items-center gap-3 px-gutter py-3.5 md:gap-6">
        <Link to="/" className="shrink-0 rounded-md">
          <Logo />
        </Link>
        {page === 'landing' && (
          <nav aria-label="Page sections" className="hidden flex-1 justify-center gap-1 md:flex">
            {sections.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="rounded-md px-3 py-1.5 text-interface font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {label}
              </a>
            ))}
          </nav>
        )}
        <div className="ml-auto flex items-center gap-2">
          {page === 'landing' && (
            // The narrowest phones have no room for it here, so it moves into the menu.
            <Link
              to="/sign-in"
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'max-[379px]:hidden')}
            >
              Sign in
            </Link>
          )}
          {/* Entering the demo changes state, so it isn't preloaded on hover. */}
          <Link to="/demo" preload={false} className={buttonVariants({ size: 'sm' })}>
            Try the demo
          </Link>
          {/* On the narrowest phones the landing page has it in its menu instead. */}
          <ThemeToggle className={cn(page === 'landing' && 'max-[379px]:hidden')} />
          {page === 'landing' && <SectionsMenu />}
        </div>
      </div>
    </header>
  )
}

/** Below md the section links are hidden, so a menu button opens them instead. */
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

  return (
    <div
      ref={rootRef}
      className="md:hidden"
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
        className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-8')}
      >
        {open ? <X aria-hidden /> : <Menu aria-hidden />}
      </button>
      {open && (
        <nav
          id={panelId}
          aria-label="Page sections"
          className="absolute inset-x-0 top-full border-b border-border/80 bg-card px-gutter py-2 shadow-panel"
        >
          <ul className="flex flex-col">
            {sections.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex h-11 items-center rounded-md px-3 text-interface font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {label}
                </a>
              </li>
            ))}
            <li className="min-[380px]:hidden">
              <ThemeToggle row />
            </li>
            <li className="min-[380px]:hidden">
              <Link
                to="/sign-in"
                className="flex h-11 items-center rounded-md px-3 text-interface font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Sign in
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  )
}
