import { useId } from 'react'
import { formatMinutes, minutesPerForm, minutesPerReply, minutesSaved } from '../lib/time-saved'
import type { WeeklyStats } from '../types'

/** What the AI took off the user's plate this week. Hidden until they approve something. */
export function WeeklySummary({ stats }: { stats: WeeklyStats }) {
  const headingId = useId()
  if (stats.draftsApproved === 0) return null
  return (
    <section
      aria-labelledby={headingId}
      className="mb-8 rounded-lg border border-border bg-card px-5 py-4 shadow-panel md:px-6"
    >
      <h2
        id={headingId}
        className="text-label font-semibold tracking-[0.08em] text-muted-foreground uppercase"
      >
        Last 7 days
      </h2>
      <dl className="mt-3 grid grid-cols-3 gap-4">
        <Stat label="Drafts approved" value={String(stats.draftsApproved)} />
        <Stat label="Forms filled" value={String(stats.formsApproved)} />
        <Stat label="Time saved (est.)" value={formatMinutes(minutesSaved(stats))} />
      </dl>
      <p className="mt-3 text-label text-muted-foreground">
        Estimated at {minutesPerReply} minutes a reply and {minutesPerForm} a form.
      </p>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col-reverse justify-end gap-0.5">
      <dt className="text-metadata text-muted-foreground">{label}</dt>
      <dd className="font-display text-xl leading-tight font-semibold tracking-tight">{value}</dd>
    </div>
  )
}
