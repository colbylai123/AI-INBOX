import { LiveDot } from '@/components/layout/live-dot'
import { ChatBubble, PriorityBadge } from '@/features/inbox'

// Static product object for the sign-in page: one prioritized message and its AI draft.
export function SignInPreview() {
  return (
    <div
      aria-hidden
      className="relative w-full max-w-md justify-self-center rounded-lg border border-hairline-2 bg-material p-5 md:p-6 lg:justify-self-end"
    >
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-hairline pb-4">
        <span className="truncate text-bright">RFI #42: footing detail</span>
        <PriorityBadge priority="high" />
      </div>
      <div className="flex flex-col gap-4">
        <ChatBubble from="incoming" label="site-super@example.com">
          Need clarification on the rebar spacing before Thursday's pour.
        </ChatBubble>
        <ChatBubble from="draft" label="AI draft">
          Thanks, we're checking S-201 against the spec and will confirm by Wednesday noon.
        </ChatBubble>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-hairline pt-4">
        <span className="flex items-center gap-2 font-mono text-xs text-meta">
          <LiveDot /> Waiting for approval
        </span>
        <span className="rounded-full bg-bright px-3.5 py-1.5 text-xs font-medium text-inverse-ink">
          Approve & send
        </span>
      </div>
    </div>
  )
}
