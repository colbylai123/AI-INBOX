import { Clock, FileText } from 'lucide-react'
import { ChatBubble, PriorityBadge } from '@/features/inbox'

// Static product object for the sign-in page: one prioritized email, its AI draft
// and the form the AI filled in.
export function SignInPreview() {
  return (
    <div
      aria-hidden
      className="relative w-full max-w-md justify-self-center rounded-lg border border-border bg-card p-5 shadow-panel md:p-6 lg:justify-self-end"
    >
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-border pb-4">
        <span className="truncate text-interface font-semibold">Quote for 40 units by Friday</span>
        <PriorityBadge priority="high" />
      </div>
      <div className="flex flex-col gap-4">
        <ChatBubble from="incoming" label="orders@brightline.example">
          Could you send pricing for 40 units, delivered by November 14?
        </ChatBubble>
        <ChatBubble from="draft" label="AI draft">
          Thanks, Maya. The quote for 40 units is attached, with delivery by November 14.
        </ChatBubble>
        <div className="flex items-center gap-2 self-end rounded-md border border-border bg-card px-3 py-2 text-metadata font-medium shadow-xs">
          <FileText className="size-3.5 text-primary" />
          Quote form
          <span className="font-normal text-muted-foreground">· filled by AI</span>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
        <span className="flex items-center gap-2 text-metadata text-muted-foreground">
          <Clock className="size-3.5 text-primary" /> Waiting for approval
        </span>
        <span className="rounded-md bg-primary px-3.5 py-1.5 text-metadata font-medium text-primary-foreground">
          Approve & send
        </span>
      </div>
    </div>
  )
}
