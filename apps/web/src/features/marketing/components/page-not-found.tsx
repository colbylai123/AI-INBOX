import { Link } from '@tanstack/react-router'
import { buttonVariants } from '@/components/ui/button'
import { usePageTitle } from '@/lib/use-page-title'
import { SiteHeader } from './site-header'

/** An address that isn't part of the site, such as a mistyped link. */
export function PageNotFound() {
  usePageTitle('Page not found')
  return (
    <div className="flex min-h-svh flex-col" data-surface="not-found">
      <SiteHeader />
      <main className="grid flex-1 place-items-center px-gutter py-16">
        <div className="w-full max-w-md rounded-lg border border-card-edge bg-card p-8 shadow-panel md:p-10">
          <h1 className="font-display text-2xl leading-tight font-semibold tracking-[-0.02em]">
            Page not found
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            There's nothing at this address. Check the link, or start from the home page.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/" className={buttonVariants()}>
              Go to the home page
            </Link>
            <Link to="/inbox" className={buttonVariants({ variant: 'outline' })}>
              Open the inbox
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
