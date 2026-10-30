/**
 * The sample mailbox has a person and a Friday, so the demo isn't an empty shell
 * with a title and a list. Shown only while demo mode is on.
 */
export function DemoWelcome() {
  return (
    <section
      aria-label="About this sample mailbox"
      className="mb-6 rounded-lg border border-white/65 bg-card px-5 py-4 shadow-panel md:px-6"
    >
      <p className="text-label font-medium tracking-[0.12em] text-muted-foreground uppercase">
        Sample Friday
      </p>
      <h2 className="mt-1.5 font-display text-lg leading-snug font-semibold tracking-tight">
        You’re covering the desk at Northwind Studio.
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Maya at Brightline needs a quote for forty units before the weekend. Harbor Supply’s invoice
        can wait until next week. The newsletter needs nothing from you. Open a message, change the
        draft if you want, then approve it. You get ten seconds to take it back, and nothing you
        approve is actually sent.
      </p>
    </section>
  )
}
