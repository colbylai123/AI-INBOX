import { Link } from '@tanstack/react-router'
import { Logo } from '@/components/layout/logo'
import { buttonVariants } from '@/components/ui/button'

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
      <div className="mx-auto flex max-w-page items-center gap-6 px-gutter py-3.5">
        <Link to="/" className="rounded-md">
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
            <Link to="/sign-in" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              Sign in
            </Link>
          )}
          {/* Entering the demo changes state, so it isn't preloaded on hover. */}
          <Link to="/demo" preload={false} className={buttonVariants({ size: 'sm' })}>
            Try the demo
          </Link>
        </div>
      </div>
    </header>
  )
}
