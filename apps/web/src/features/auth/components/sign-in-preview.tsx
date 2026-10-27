import { Check } from 'lucide-react'
import { ChatBubble, PriorityBadge } from '@/features/inbox'

// Static illustration for the sign-in page: one prioritized message and its AI draft.
export function SignInPreview() {
  return (
    <div
      aria-hidden
      className="relative mx-auto w-full max-w-md rotate-[-3deg] rounded-[2.5rem] border border-white/10 bg-card/90 p-5 shadow-2xl ring-8 shadow-black/50 ring-black/40 md:p-6"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="truncate font-semibold">RFI #42: footing detail</span>
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
      <div className="mt-5 flex justify-end">
        <span className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[11px] font-semibold tracking-wider text-primary-foreground uppercase">
          <Check className="size-3.5" /> Approve & send
        </span>
      </div>
    </div>
  )
}
