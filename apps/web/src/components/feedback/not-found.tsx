import { Link } from '@tanstack/react-router'

export function NotFound() {
  return (
    <div className="flex flex-col items-start gap-2 p-8">
      <h1 className="text-lg font-semibold">Not found</h1>
      <p className="text-sm text-muted-foreground">This page or item doesn't exist.</p>
      <Link to="/inbox" className="text-sm underline underline-offset-4">
        Back to inbox
      </Link>
    </div>
  )
}
