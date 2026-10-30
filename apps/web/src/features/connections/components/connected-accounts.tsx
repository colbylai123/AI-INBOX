import { Mail, Plug } from 'lucide-react'
import { useState } from 'react'
import { Notice } from '@/components/feedback/notice'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useConnectOutlook } from '../hooks/use-connect-outlook'
import { useDisconnect } from '../hooks/use-disconnect'
import { syncLabel } from '../lib/sync-label'
import { type Connection, providerNames } from '../types'

/** Settings card: the email accounts the AI reads, with connect, reconnect and disconnect. */
export function ConnectedAccounts({
  connections,
  result,
}: {
  connections: Connection[]
  /** What Microsoft's redirect reported, from ?connection= on the URL. */
  result?: 'connected' | 'failed'
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected email</CardTitle>
        <CardDescription>
          The AI reads new mail from these accounts. It only sends a reply when you approve it.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {result === 'connected' && (
          <Notice tone="success">Outlook is connected. New mail will show up in your inbox.</Notice>
        )}
        {result === 'failed' && (
          <Notice tone="error">
            Outlook wasn't connected. You may have cancelled, or Microsoft refused access. Try
            again.
          </Notice>
        )}
        {connections.length === 0 ? (
          <div className="flex flex-col items-start gap-4 rounded-md border border-dashed border-border p-5">
            <p className="text-sm text-muted-foreground">
              No email connected yet. You'll sign in to Microsoft and approve access.
            </p>
            <ConnectButton>Connect Outlook</ConnectButton>
          </div>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {connections.map((connection) => (
              <ConnectionRow key={connection.id} connection={connection} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function ConnectionRow({ connection }: { connection: Connection }) {
  const [confirming, setConfirming] = useState(false)
  const disconnect = useDisconnect()
  const needsReconnect = connection.status === 'reconnect_needed'
  const name = providerNames[connection.provider]

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary-soft text-primary">
        <Mail className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 font-semibold">
          {name}
          <Badge variant={needsReconnect ? 'destructive' : 'secondary'} className="normal-case">
            {needsReconnect ? 'Needs reconnecting' : 'Connected'}
          </Badge>
        </p>
        <p className="truncate text-metadata text-muted-foreground">
          {connection.accountEmail} · {syncLabel(connection)}
        </p>
      </div>
      {/* Keyed so the confirm buttons are new elements: a double click on Disconnect
          can't land on the confirmation, and focus starts on the safe choice. */}
      {confirming ? (
        <div
          key="confirm"
          role="group"
          aria-label={`Disconnect ${name}?`}
          className="flex w-full flex-wrap items-center justify-end gap-2"
        >
          <span className="text-metadata text-muted-foreground">New mail stops arriving.</span>
          <Button
            size="sm"
            variant="destructive"
            disabled={disconnect.isPending}
            onClick={() => disconnect.mutate(connection.id)}
          >
            Disconnect
          </Button>
          <Button size="sm" variant="ghost" autoFocus onClick={() => setConfirming(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <div key="actions" className="flex gap-2">
          {needsReconnect && <ConnectButton size="sm">Reconnect</ConnectButton>}
          <Button size="sm" variant="outline" onClick={() => setConfirming(true)}>
            Disconnect
          </Button>
        </div>
      )}
      {disconnect.isError && (
        <p role="alert" className="w-full text-metadata text-destructive">
          Couldn't disconnect {name}. Try again.
        </p>
      )}
    </li>
  )
}

/** Starts Microsoft's sign-in for Outlook; also used to reconnect. */
export function ConnectButton({ children, size }: { children: string; size?: 'sm' | 'default' }) {
  const connect = useConnectOutlook()
  return (
    <Button size={size} disabled={connect.isPending} onClick={() => connect.mutate()}>
      <Plug aria-hidden /> {connect.isPending ? 'Opening Microsoft…' : children}
    </Button>
  )
}
