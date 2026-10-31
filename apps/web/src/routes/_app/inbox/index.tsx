import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { MailOpen } from 'lucide-react'
import { DemoWelcome } from '@/components/layout/demo-welcome'
import { useDemoMode } from '@/lib/demo-mode'
import { ConnectPrompt } from '@/features/connections'
import { useInboxList, WeeklySummary, weeklyStatsQuery } from '@/features/inbox'
import { materialsQuery } from '@/features/materials'
import { GettingStarted } from '@/features/onboarding'

// The reading card with no email open: what to do next, the setup checklist and
// the week's numbers. The list beside it is in ./route.tsx.
export const Route = createFileRoute('/_app/inbox/')({
  component: InboxOverview,
})

function InboxOverview() {
  const demo = useDemoMode()
  const { search, connections, account, ofAccount } = useInboxList()
  // Not suspense: if these fail to load, the inbox still shows, just without the checklist or stats.
  const materials = useQuery(materialsQuery())
  const stats = useQuery(weeklyStatsQuery())
  const unfiltered = !search.priority && !search.q && !account && !search.folder
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7">
      {connections.length === 0 ? (
        <ConnectPrompt />
      ) : (
        <>
          <div className="mb-6 flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
              <MailOpen className="size-5" aria-hidden />
            </span>
            <div>
              <h1 className="font-display text-xl leading-tight font-semibold tracking-[-0.02em]">
                Inbox
              </h1>
              <p className="mt-1 text-metadata text-muted-foreground">
                {demo ? 'Sample emails' : 'Incoming email'}, most important first. Open one to read
                it and review its draft. Press{' '}
                <kbd className="rounded-sm border border-border bg-muted px-1.5">?</kbd> for
                keyboard shortcuts.
              </p>
            </div>
          </div>
          {demo && <DemoWelcome />}
          {stats.isSuccess && <WeeklySummary stats={stats.data} />}
          {/* Only on the unfiltered inbox, where "approved any yet?" sees every message. */}
          {unfiltered && materials.isSuccess && (
            <GettingStarted
              connected={connections.some((c) => c.status === 'connected')}
              hasMaterials={materials.data.length > 0}
              hasApproved={ofAccount.some((m) => m.approvedAt)}
              nextDraftId={ofAccount.find((m) => m.hasDraft && !m.approvedAt)?.id}
            />
          )}
        </>
      )}
    </div>
  )
}
