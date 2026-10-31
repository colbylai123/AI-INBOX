import { Link } from '@tanstack/react-router'
import type { User } from '@/features/auth'

/** The signed-in person, as a round mark that opens Settings. */
export function AccountLink({ user }: { user: User }) {
  return (
    <Link
      to="/settings"
      title={user.name}
      className="grid size-9 shrink-0 place-items-center rounded-full bg-raised text-metadata font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-muted"
    >
      <span aria-hidden>{user.name.charAt(0)}</span>
      <span className="sr-only">{user.name}</span>
    </Link>
  )
}
