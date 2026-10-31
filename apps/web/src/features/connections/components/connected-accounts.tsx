import { Mail, Plug } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Notice } from '@/components/feedback/notice'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useConnect } from '../hooks/use-connect'
import { useDisconnect } from '../hooks/use-disconnect'
import { syncLabel } from '../lib/sync-label'
import {
  type Connection,
  type Provider,
  providerCompanies,
  providerNames,
  providers,
} from '../types'

/** Settings card: the email accounts the AI reads, with connect, reconnect and disconnect. */
export function ConnectedAccounts({
  connections,
  result,
  provider,
}: {
  connections: Connection[]
  /** What the provider's redirect reported, from ?connection= on the URL. */
  result?: 'connected' | 'failed'
  /** Which provider that was, from ?provider= on the URL. */
  provider?: Provider
}) {
  const name = provider ? providerNames[provider] : 'Your email'
  const disconnect = useDisconnect()
  // The account just disconnected. Its row is gone, so focus that was on its
  // Disconnect button comes to the notice that says so.
  const [disconnected, setDisconnected] = useState<Connection | null>(null)
  const noticeRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  useEffect(() => {
    const focus = document.activeElement
    if (disconnected && (focus === document.body || listRef.current?.contains(focus))) {
      noticeRef.current?.focus()
    }
  }, [disconnected])
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
          <Notice tone="success">{name} is connected. New mail will show up in your inbox.</Notice>
        )}
        {result === 'failed' && (
          <Notice tone="error">
            {name} wasn't connected. You may have cancelled, or{' '}
            {provider ? providerCompanies[provider] : 'the provider'} refused access. Try again.
          </Notice>
        )}
        {disconnected && (
          <div ref={noticeRef} tabIndex={-1} className="outline-none">
            <Notice tone="success">
              {providerNames[disconnected.provider]} is disconnected. New mail from{' '}
              {disconnected.accountEmail} no longer arrives.
            </Notice>
          </div>
        )}
        {connections.length === 0 ? (
          <div className="flex flex-col items-start gap-4 rounded-md border border-dashed border-border p-5">
            <p className="text-sm text-muted-foreground">
              No email connected yet. You'll sign in to Microsoft or Google and approve access.
            </p>
            <ConnectButtons />
          </div>
        ) : (
          <>
            <ul ref={listRef} className="divide-y divide-border rounded-md border border-card-edge">
              {connections.map((connection) => (
                <ConnectionRow
                  key={connection.id}
                  connection={connection}
                  pending={disconnect.isPending && disconnect.variables === connection.id}
                  failed={disconnect.isError && disconnect.variables === connection.id}
                  onDisconnect={() =>
                    disconnect.mutate(connection.id, {
                      onSuccess: () => setDisconnected(connection),
                    })
                  }
                />
              ))}
            </ul>
            {/* Mail from every account lands in the one inbox, so more can be added at any time. */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-metadata text-muted-foreground">Add another account</span>
              <ConnectButtons size="sm" variant="outline" />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function ConnectionRow({
  connection,
  pending,
  failed,
  onDisconnect,
}: {
  connection: Connection
  pending: boolean
  failed: boolean
  onDisconnect: () => void
}) {
  const [confirming, setConfirming] = useState(false)
  // Cancel puts focus back on Disconnect, where it was before the question.
  const [cancelled, setCancelled] = useState(false)
  const needsReconnect = connection.status === 'reconnect_needed'
  const name = providerNames[connection.provider]

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary-soft text-primary">
        <Mail className="size-5" aria-hidden />
      </span>
      {/* Wide enough for the address, which tells two accounts apart; on phones the
          buttons wrap below instead of cutting it off. */}
      <div className="min-w-48 flex-1">
        <p className="flex flex-wrap items-center gap-2 font-semibold">
          {name}
          <Badge variant={needsReconnect ? 'destructive' : 'secondary'} className="normal-case">
            {needsReconnect ? 'Needs reconnecting' : 'Connected'}
          </Badge>
        </p>
        <p className="text-metadata [overflow-wrap:anywhere] text-muted-foreground">
          {connection.accountEmail} · {syncLabel(connection)}
        </p>
      </div>
      {/* Keyed so the confirm buttons are new elements: a double click on Disconnect
          can't land on the confirmation, and focus starts on the safe choice. */}
      {confirming ? (
        <div
          key="confirm"
          role="group"
          // The address, since two accounts can share a provider.
          aria-label={`Disconnect ${connection.accountEmail}?`}
          className="flex w-full flex-wrap items-center justify-end gap-2"
        >
          <span className="text-metadata text-muted-foreground">New mail stops arriving.</span>
          <Button size="sm" variant="destructive" disabled={pending} onClick={onDisconnect}>
            Disconnect
          </Button>
          <Button
            size="sm"
            variant="ghost"
            autoFocus
            onClick={() => {
              setConfirming(false)
              setCancelled(true)
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div key="actions" className="flex gap-2">
          {needsReconnect && (
            <ConnectButton provider={connection.provider} connectionId={connection.id} size="sm">
              Reconnect
            </ConnectButton>
          )}
          <Button
            size="sm"
            variant="outline"
            autoFocus={cancelled}
            onClick={() => setConfirming(true)}
          >
            Disconnect
          </Button>
        </div>
      )}
      {failed && (
        <p role="alert" className="w-full text-metadata text-destructive">
          Couldn't disconnect {name}. Try again.
        </p>
      )}
    </li>
  )
}

/** One button per provider: Connect Outlook, Connect Gmail. */
export function ConnectButtons(props: Omit<ConnectButtonProps, 'provider' | 'children'>) {
  return providers.map((provider) => (
    <ConnectButton key={provider} provider={provider} {...props}>
      {`Connect ${providerNames[provider]}`}
    </ConnectButton>
  ))
}

type ConnectButtonProps = {
  provider: Provider
  /** Set when this button reconnects one row, so that account is the one updated. */
  connectionId?: string
  children: string
  size?: 'sm' | 'default'
  variant?: 'default' | 'outline'
}

/** Starts the provider's sign-in, to connect an account or reconnect one. */
export function ConnectButton({
  provider,
  connectionId,
  children,
  size,
  variant,
}: ConnectButtonProps) {
  const connect = useConnect(provider, connectionId)
  const company = providerCompanies[provider]
  return (
    <div className="flex flex-col items-start gap-1.5">
      <Button
        size={size}
        variant={variant}
        disabled={connect.isPending}
        onClick={() => connect.mutate()}
      >
        <Plug aria-hidden /> {connect.isPending ? `Opening ${company}…` : children}
      </Button>
      {/* Only a failure before the page leaves for the provider lands here. */}
      {connect.isError && (
        <p role="alert" className="text-metadata text-destructive">
          Couldn't open {company}. Try again.
        </p>
      )}
    </div>
  )
}
