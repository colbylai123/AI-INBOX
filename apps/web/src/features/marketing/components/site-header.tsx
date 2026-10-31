import { Link } from '@tanstack/react-router'
import { Logo } from '@/components/layout/logo'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { buttonVariants } from '@/components/ui/button'

/** Header for the sign-in page. The landing page has its own, over the hero. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border/80 bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-page items-center gap-3 px-gutter py-3.5 md:gap-6">
        <Link to="/" className="shrink-0 rounded-md">
          <Logo />
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {/* Entering the demo changes state, so it isn't preloaded on hover. */}
          <Link to="/demo" preload={false} className={buttonVariants({ size: 'sm' })}>
            Try the demo
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
