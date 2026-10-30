import { Mail, Plug } from 'lucide-react'
import { useState } from 'react'
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
        {connections.length === 0 ? (
          <div className="flex flex-col items-start gap-4 rounded-md border border-dashed border-border p-5">
            <p className="text-sm text-muted-foreground">
              No email connected yet. You'll sign in to Microsoft or Google and approve access.
            </p>
            <ConnectButtons />
          </div>
        ) : (
          <>
            <ul className="divide-y divide-border rounded-md border border-white/65">
              {connections.map((connection) => (
                <ConnectionRow key={connection.id} connection={connection} />
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
          {needsReconnect && (
            <ConnectButton provider={connection.provider} size="sm">
              Reconnect
            </ConnectButton>
          )}
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
  children: string
  size?: 'sm' | 'default'
  variant?: 'default' | 'outline'
}

/** Starts the provider's sign-in, to connect an account or reconnect one. */
export function ConnectButton({ provider, children, size, variant }: ConnectButtonProps) {
  const connect = useConnect(provider)
  return (
    <Button
      size={size}
      variant={variant}
      disabled={connect.isPending}
      onClick={() => connect.mutate()}
    >
      <Plug aria-hidden />{' '}
      {connect.isPending ? `Opening ${providerCompanies[provider]}…` : children}
    </Button>
  )
}
