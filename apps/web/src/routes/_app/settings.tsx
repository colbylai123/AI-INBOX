import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod/mini'
import { PageHeader } from '@/components/layout/page-header'
import { AccountCard } from '@/features/auth'
import { ConnectedAccounts, connectionsQuery, providers } from '@/features/connections'

export const Route = createFileRoute('/_app/settings')({
  // Microsoft's or Google's redirect comes back here with ?provider=…&connection=connected|failed.
  validateSearch: z.object({
    connection: z.catch(z.optional(z.enum(['connected', 'failed'])), undefined),
    provider: z.catch(z.optional(z.enum(providers)), undefined),
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(connectionsQuery()),
  component: SettingsPage,
})

function SettingsPage() {
  const { connection, provider } = Route.useSearch()
  const { user } = Route.useRouteContext()
  const { data: connections } = useSuspenseQuery(connectionsQuery())
  return (
    <>
      <PageHeader title="Settings" description="Your connected email and your account." />
      <div className="grid max-w-2xl gap-6">
        <ConnectedAccounts connections={connections} result={connection} provider={provider} />
        <AccountCard user={user} />
      </div>
    </>
  )
}
