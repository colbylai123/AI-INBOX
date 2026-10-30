import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDemoMode } from '@/lib/demo-mode'
import { useSignOut } from '../hooks/use-sign-out'
import type { User } from '../types'

export function AccountCard({ user }: { user: User }) {
  const signOut = useSignOut()
  const demo = useDemoMode()
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-4">
        <span
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-full bg-muted font-semibold"
        >
          {user.name.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{user.name}</p>
          <p className="truncate text-metadata text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="outline" disabled={signOut.isPending} onClick={() => signOut.mutate()}>
          <LogOut aria-hidden /> {demo ? 'Exit demo' : 'Sign out'}
        </Button>
        {signOut.isError && (
          <p role="alert" className="w-full text-metadata text-destructive">
            Couldn't sign out. Try again.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
