import { Clock, FileText, Sparkles } from 'lucide-react'
import { ChatBubble, PriorityBadge } from '@/features/inbox'

// Static product picture for the landing page: one ranked email with its summary,
// the AI's draft and the form it filled in, waiting for approval.
export function ProductPreview() {
  return (
    <div
      aria-hidden
      className="mx-auto w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-panel md:p-6"
    >
      <div className="mb-5 border-b border-border pb-4">
        <div className="flex items-center justify-between gap-3">
          <span className="truncate text-interface font-semibold">
            Quote for 40 units by Friday
          </span>
          <PriorityBadge priority="high" />
        </div>
        <p className="mt-2 flex items-start gap-2 text-metadata text-muted-foreground">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
          Wants a quote for 40 units, delivered by Nov 14.
        </p>
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
        <span className="rounded-md bg-primary px-3.5 py-1.5 text-metadata font-medium whitespace-nowrap text-primary-foreground">
          Approve & send
        </span>
      </div>
    </div>
  )
}
