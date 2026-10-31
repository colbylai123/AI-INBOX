import { createFileRoute, Outlet, useParams } from '@tanstack/react-router'
import { z } from 'zod/mini'
import { AccountLink } from '@/components/layout/account-link'
import { Button } from '@/components/ui/button'
import { ThemePill } from '@/components/layout/theme-toggle'
import { AccountFilter, connectionsQuery, ReconnectAlert } from '@/features/connections'
import {
  folders,
  FolderChips,
  folderNames,
  MessageList,
  messagesQuery,
  NewEmailButton,
  priorities,
  PriorityFilter,
  SearchBox,
  useInboxList,
  weeklyStatsQuery,
} from '@/features/inbox'
import { materialsQuery } from '@/features/materials'

// The inbox is one canvas: the search, the folder chips, and two cards, the list and
// the open email. The list's folder, filters and search are declared here, on the
// parent of both the list and each email, so opening one keeps them (/inbox/m1?q=quote).
export const Route = createFileRoute('/_app/inbox')({
  // Typed, validated URL state. Unknown values fall back to the inbox and "all".
  validateSearch: z.object({
    priority: z.catch(z.optional(z.enum(priorities)), undefined),
    // Search words. The list is filtered in the browser, so they aren't a loader dep.
    q: z.catch(z.optional(z.string()), undefined),
    // One account's mail, by connection id. Also filtered in the browser.
    account: z.catch(z.optional(z.string()), undefined),
    // A folder chip other than Inbox.
    folder: z.catch(z.optional(z.enum(folders)), undefined),
  }),
  loaderDeps: ({ search }) => ({ priority: search.priority }),
  loader: ({ context, deps }) => {
    // Only for the checklist and the stats, so they're fetched alongside but never hold up the inbox.
    void context.queryClient.prefetchQuery(materialsQuery())
    void context.queryClient.prefetchQuery(weeklyStatsQuery())
    return Promise.all([
      // Waited for, so the list doesn't flash empty, but neither failure stops an
      // email opened by its link from showing. See useInboxList.
      context.queryClient.ensureQueryData(messagesQuery(deps)).catch(() => undefined),
      context.queryClient.ensureQueryData(connectionsQuery()).catch(() => undefined),
    ])
  },
  component: InboxLayout,
})

function InboxLayout() {
  const { user } = Route.useRouteContext()
  const navigate = Route.useNavigate()
  const {
    search,
    connections,
    account,
    ofAccount,
    inList,
    listed,
    inboxCount,
    listFailed,
    retryList,
  } = useInboxList()
  const openId = useParams({ strict: false }).messageId
  const manyAccounts = connections.length > 1
  const filtersOn = Boolean(search.priority || account)

  return (
    <div className="flex flex-col gap-3">
      {/* Printing prints only the open email, so everything but its card is hidden. */}
      <div className="contents print:hidden">
        <SearchBox
          query={search.q}
          onQueryChange={(next) =>
            void navigate({ search: (prev) => ({ ...prev, q: next }), replace: true })
          }
          filtersOn={filtersOn}
          filters={
            <>
              <PriorityFilter value={search.priority} />
              {manyAccounts && (
                <AccountFilter
                  connections={connections}
                  value={account}
                  onChange={(next) =>
                    void navigate({ search: (prev) => ({ ...prev, account: next }) })
                  }
                />
              )}
            </>
          }
        />

        {/* Phones: New email and the theme and account controls on one line, the chips
          scrolling sideways under them. Wide screens: all of it on one line. */}
        <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
          <NewEmailButton openId={openId} listed={listed} all={ofAccount} />
          <FolderChips
            folder={search.folder}
            inboxCount={inboxCount}
            className="order-last w-full lg:order-none lg:w-auto lg:flex-1"
          />
          <span className="ml-auto flex shrink-0 items-center gap-2 pl-4 sm:pl-8">
            <ThemePill />
            <AccountLink user={user} />
          </span>
        </div>

        <ReconnectAlert connections={connections} />
      </div>

      <div className="grid gap-3 lg:h-[max(34rem,calc(100svh-15rem))] lg:grid-cols-[minmax(20rem,26rem)_1fr] print:block print:h-auto">
        <section
          aria-labelledby="list-heading"
          className="flex max-h-[30rem] min-h-0 min-w-0 flex-col rounded-[20px] border border-card-edge bg-card shadow-panel lg:max-h-none print:hidden"
        >
          <div className="flex items-baseline justify-between gap-3 px-5 pt-4 pb-2">
            <h2 id="list-heading" className="text-metadata font-semibold text-muted-foreground">
              {folderNames[search.folder ?? 'inbox']}
            </h2>
            {/* Says how many matched as the user types. Empty when not searching. */}
            <p role="status" className="text-label text-muted-foreground">
              {listed !== inList && `${listed.length} of ${inList.length} messages match`}
            </p>
          </div>
          {listFailed ? (
            <div role="alert" className="flex flex-wrap items-center gap-3 px-5 pt-2 pb-6">
              <p className="text-metadata text-muted-foreground">The list didn't load.</p>
              <Button variant="outline" size="sm" onClick={retryList}>
                Try again
              </Button>
            </div>
          ) : listed.length === 0 && inList.length > 0 ? (
            <p className="px-5 pt-2 pb-6 text-metadata text-muted-foreground">
              No messages match “{search.q?.trim()}”.
            </p>
          ) : (
            <MessageList
              messages={listed}
              showAccount={manyAccounts && !account}
              filtered={filtersOn}
              folder={search.folder}
              // With an email open, j and k open the next one instead (see ReadingPane).
              keyboard={!openId}
            />
          )}
        </section>
        <section
          aria-label="Reading pane"
          className="flex min-h-[24rem] min-w-0 flex-col rounded-[20px] border border-card-edge bg-card shadow-panel lg:min-h-0 print:min-h-0 print:border-0 print:shadow-none"
        >
          <Outlet />
        </section>
      </div>
    </div>
  )
}
