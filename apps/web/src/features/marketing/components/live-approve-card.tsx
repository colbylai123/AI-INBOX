import { CircleCheck, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

// The same 10 seconds the app gives to take an approval back.
const HOLD_SECONDS = 10

type Step = 'draft' | 'held' | 'sent'

const whiteButton =
  'inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white px-5 text-metadata font-semibold text-[#231d33] transition-[background-color,translate,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#efe9f8] motion-safe:hover:-translate-y-0.5 motion-safe:active:opacity-80'
const quietButton =
  'inline-flex h-10 items-center justify-center rounded-full px-4 text-metadata font-semibold text-[var(--lp-on-card)] ring-1 ring-white/30 transition-[color,background-color,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-white/10 motion-safe:active:opacity-80'

/**
 * A live sample of approve and send, in one card on the hero. Approve & send swaps
 * the draft for "Ready to send" and an undo in the same card; undo brings the draft
 * back, and when the hold runs out the card says Sent. It's a sample: it never calls
 * the API and nothing is sent.
 */
export function LiveApproveCard() {
  const [step, setStep] = useState<Step>('draft')
  const [secondsLeft, setSecondsLeft] = useState(HOLD_SECONDS)
  const [announcement, setAnnouncement] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)
  const focusNext = useRef(false)

  useEffect(() => {
    if (step !== 'held') return
    const started = Date.now()
    const timer = setInterval(() => {
      const left = HOLD_SECONDS - Math.floor((Date.now() - started) / 1000)
      if (left > 0) return setSecondsLeft(left)
      clearInterval(timer)
      // Focus follows the swap only if it was in the card, so it never jumps the page.
      focusNext.current = !!cardRef.current?.contains(document.activeElement)
      setAnnouncement('Sent. In the sample, nothing left this page.')
      setStep('sent')
    }, 250)
    return () => clearInterval(timer)
  }, [step])

  // After each swap, the new step's button takes focus if the old one had it.
  useEffect(() => {
    if (!focusNext.current) return
    focusNext.current = false
    cardRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
  }, [step])

  const go = (next: Step, said: string) => {
    focusNext.current = true
    setSecondsLeft(HOLD_SECONDS)
    setAnnouncement(said)
    setStep(next)
  }

  return (
    <div
      ref={cardRef}
      className="rounded-[28px] bg-[var(--lp-card)] p-5 text-[var(--lp-on-card)] shadow-[0_24px_60px_-24px_rgb(20_14_32/0.6)] backdrop-blur-xl sm:p-6"
    >
      <p className="flex items-center justify-between gap-3 text-label font-semibold tracking-[0.12em] text-[var(--lp-on-card-soft)] uppercase">
        <span>A sample email</span>
        <span className="tracking-normal normal-case">Nothing here sends</span>
      </p>
      {/* Each swap is read out in a line, not the whole card again. */}
      <p role="status" className="sr-only">
        {announcement}
      </p>
      {/*
        The draft stays in place, hidden while the confirmation sits over it in the same
        spot, so the card keeps its height through the swap.
      */}
      <div className="mt-4 grid">
        <div
          aria-hidden={step !== 'draft'}
          className={cn(
            'col-start-1 row-start-1',
            step === 'draft'
              ? 'animate-in duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] fade-in'
              : 'invisible',
          )}
        >
          <p className="text-interface font-semibold">Quote for 40 units by Friday</p>
          <p className="text-metadata text-[var(--lp-on-card-soft)]">
            Maya at Brightline · orders@brightline.example
          </p>
          <p className="mt-3 flex items-start gap-2 text-metadata text-[var(--lp-on-card-soft)]">
            <Sparkles className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            Wants pricing for 40 units, delivered to Austin by Nov 14.
          </p>
          <div className="mt-4 rounded-2xl bg-white/8 p-4 text-metadata leading-relaxed ring-1 ring-white/10">
            <p className="mb-1.5 text-label font-semibold tracking-[0.08em] text-[var(--lp-on-card-soft)] uppercase">
              Draft
            </p>
            Hi Maya, the quote for 40 units is attached, with delivery to Austin by November 14. Let
            me know if you’d like to change the quantity.
          </div>
        </div>
        {step !== 'draft' && (
          // Keyed, so each step fades in fresh: a short crossfade in the same card.
          <div
            key={step}
            className="col-start-1 row-start-1 flex animate-in flex-col justify-center duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] fade-in"
          >
            {step === 'held' ? (
              <>
                <p className="font-display text-2xl font-semibold tracking-tight">Ready to send</p>
                <p className="mt-2 text-metadata text-[var(--lp-on-card-soft)]">
                  It goes in{' '}
                  <span className="tabular-nums" aria-hidden>
                    {secondsLeft}s
                  </span>
                  <span className="sr-only">{HOLD_SECONDS} seconds</span>. Changed your mind? Undo,
                  and the draft comes back.
                </p>
              </>
            ) : (
              <>
                <p className="flex items-center gap-2 font-display text-2xl font-semibold tracking-tight">
                  <CircleCheck className="size-6 text-[var(--lp-lime)]" aria-hidden /> Sent
                </p>
                <p className="mt-2 text-metadata text-[var(--lp-on-card-soft)]">
                  Read it, approve it, then it sends. In the sample, nothing left this page.
                </p>
              </>
            )}
          </div>
        )}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {step === 'draft' && (
          <button
            type="button"
            className={whiteButton}
            onClick={() =>
              go('held', `Ready to send. It sends in ${HOLD_SECONDS} seconds unless you undo.`)
            }
          >
            Approve &amp; send
          </button>
        )}
        {step === 'held' && (
          <button
            type="button"
            className={quietButton}
            onClick={() => go('draft', 'Not sent. The draft is back.')}
          >
            Undo
          </button>
        )}
        {step === 'sent' && (
          <button
            type="button"
            className={quietButton}
            onClick={() => go('draft', 'The draft is back.')}
          >
            See it again
          </button>
        )}
      </div>
    </div>
  )
}
