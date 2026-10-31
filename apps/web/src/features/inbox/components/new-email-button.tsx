import { useNavigate } from '@tanstack/react-router'
import { PenLine } from 'lucide-react'
import { useId } from 'react'
import { Button } from '@/components/ui/button'
import type { MessageSummary } from '../types'

const waiting = (m: MessageSummary) => m.hasDraft && !m.approvedAt

/**
 * The violet "New email" pill from the reference. This app doesn't write new mail,
 * so it opens a drafted reply instead: the open email's draft, for editing, or the
 * first email in the list with a draft waiting. It never sends anything.
 */
export function NewEmailButton({
  openId,
  listed,
  all,
}: {
  openId: string | undefined
  listed: MessageSummary[]
  all: MessageSummary[]
}) {
  const navigate = useNavigate()
  const descriptionId = useId()
  const open = all.find((m) => m.id === openId)
  const target = open && waiting(open) ? open : listed.find(waiting)
  return (
    <>
      <Button
        variant="approve"
        aria-describedby={descriptionId}
        disabled={!target}
        onClick={() => {
          if (!target) return
          void navigate({
            to: '/inbox/$messageId',
            params: { messageId: target.id },
            search: true,
            // An email that's already open opens its draft for editing.
            state: target === open ? { editDraft: Date.now() } : {},
          })
        }}
        className="h-9 px-4"
      >
        <PenLine aria-hidden /> New email
      </Button>
      <span id={descriptionId} hidden>
        Opens a drafted reply to review. Nothing is sent until you approve it.
      </span>
    </>
  )
}
