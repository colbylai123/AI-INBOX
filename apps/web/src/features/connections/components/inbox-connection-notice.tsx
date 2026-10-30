import { Mail } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type Connection, providerNames } from '../types'
import { ConnectButton, ConnectButtons } from './connected-accounts'

/** Shown instead of the message list until an email account is connected. */
export function ConnectPrompt() {
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <span className="mb-2 grid size-10 place-items-center rounded-md bg-primary-soft text-primary">
          <Mail className="size-5" aria-hidden />
        </span>
        <CardTitle>Connect your email to fill your inbox</CardTitle>
        <CardDescription>
          New mail arrives here ranked, summed up and with a reply drafted. Nothing is sent until
          you approve it.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <ConnectButtons />
      </CardContent>
    </Card>
  )
}

/** Above the inbox when an account stopped syncing, since new mail isn't arriving. */
export function ReconnectAlert({ connections }: { connections: Connection[] }) {
  const broken = connections.find((c) => c.status === 'reconnect_needed')
  if (!broken) return null
  return (
    <div
      role="alert"
      className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-destructive/25 bg-destructive/5 px-5 py-4"
    >
      <p className="text-sm">
        <span className="font-semibold text-destructive">
          {providerNames[broken.provider]} needs reconnecting.
        </span>{' '}
        New mail for {broken.accountEmail} isn't arriving until you do.
      </p>
      <ConnectButton provider={broken.provider} connectionId={broken.id} size="sm">
        Reconnect
      </ConnectButton>
    </div>
  )
}
