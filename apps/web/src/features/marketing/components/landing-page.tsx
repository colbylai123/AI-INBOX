import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Check,
  ChevronDown,
  FileText,
  ListOrdered,
  Mail,
  PenLine,
  Plug,
  Send,
  Sparkles,
  Upload,
} from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Logo } from '@/components/layout/logo'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ProductPreview } from './product-preview'
import { SiteHeader } from './site-header'

const steps = [
  {
    icon: Plug,
    title: 'Connect your email',
    body: 'Connect one or more Outlook and Gmail accounts. New mail from all of them arrives in one inbox, ranked.',
  },
  {
    icon: Upload,
    title: 'Upload your forms',
    body: 'Add the quote sheets and order forms you fill in over and over, and the price lists to fill them from. PDF, Word or Excel.',
  },
  {
    icon: Send,
    title: 'Review and approve',
    body: 'Important email arrives with a summary, a drafted reply and the right form filled in. Edit anything, then approve to send.',
  },
]

const features = [
  {
    icon: ListOrdered,
    title: 'Ranked by priority',
    body: 'High, medium and low, so the email that needs you today is at the top.',
  },
  {
    icon: Sparkles,
    title: 'Summed up in a line',
    body: 'See what each message wants before you open it.',
  },
  {
    icon: PenLine,
    title: 'Replies drafted for you',
    body: 'A reply written from the email and your documents, ready for you to edit.',
  },
  {
    icon: FileText,
    title: 'Forms filled in',
    body: "The AI picks the matching form you uploaded and fills in what the email says. Anything it can't find is clearly marked.",
  },
]

const promises = [
  'Every reply and form waits for your approval. There is no auto-send.',
  'After you approve, you have 10 seconds to undo before it sends.',
  'Forms are filled only from the email in front of you and the documents you uploaded.',
  "Disconnect any account at any time and that account's access is deleted. Your other accounts stay connected.",
]

// The Microsoft and Google permissions in docs/api-contract.md (steps 5 and 9), in plain words.
const permissions = [
  { name: 'Read your mail', why: 'To rank, sum up and draft replies to new messages.' },
  {
    name: 'Send mail as you',
    why: 'Used only when you click Approve & send, from the account the email came to.',
  },
  { name: 'Your email address', why: 'To show which account each email came to.' },
  { name: 'Stay connected', why: 'So new mail keeps arriving without signing in every day.' },
]

const faqs = [
  {
    q: 'Does it ever send email on its own?',
    a: 'No. Every reply waits for you to approve it, and you can edit the reply and the form first.',
  },
  {
    q: 'Which email accounts work?',
    a: 'Outlook and Gmail. You can connect more than one account, including several of the same kind, and their mail arrives in one inbox. Support for messaging apps is planned.',
  },
  {
    q: 'What kinds of forms can I upload?',
    a: 'PDF, Word and Excel files up to 20 MB, such as quote sheets, order forms and intake forms.',
  },
  {
    q: 'Can my whole team share one inbox?',
    a: 'Not yet. Each person connects and approves from their own inbox.',
  },
]

const benefits = [
  {
    kicker: 'How it helps',
    title: 'Open the mail. The reply is already dressed.',
    body: 'A one-line summary, a draft, and the form filled from that email and the files you uploaded. You edit. You approve. That is the whole job.',
  },
  {
    kicker: 'Why the day gets lighter',
    title: 'Your night is not a second inbox.',
    body: 'The same quote, the same order, the same “yes, Friday works.” You stop writing them from a blank page. Nothing sends on its own, and you have 10 seconds to take a send back.',
  },
  {
    kicker: 'Time back, counted honestly',
    title: 'About four minutes a reply. Six more for a form.',
    body: 'Those are the minutes the app counts for a reply or a form you would have done by hand. An estimate, shown on the inbox card, not a promise. A week of approvals is where it adds up.',
  },
]

export function LandingPage() {
  return (
    // Clipped so the hero glow, which spills past the cards, never scrolls the page sideways on phones.
    <div className="relative min-h-svh overflow-x-clip" data-surface="marketing">
      <ScrollBubbles />
      <SiteHeader page="landing" />

      <main className="relative">
        {/* Hero split about 1.25 : 1, copy first, stacked below 1050px. */}
        <section className="mx-auto max-w-page px-gutter pt-10 pb-16 md:pt-14">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-metadata font-medium text-muted-foreground">A desk for work email</p>
            <p className="mt-3 font-display text-lg text-balance text-[#5c4d86]">
              Mail, but it waits its turn.
            </p>
            <h1 className="mt-3 font-display text-[clamp(32px,4vw,44px)] leading-[1.08] font-semibold tracking-[-0.04em] text-balance">
              Your inbox, sorted and drafted
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              The inbox writes the first draft. You keep the last word.{' '}
              <span className="text-foreground">Nothing sends until you approve it.</span>
            </p>
            <CallsToAction className="mt-6 justify-center" />
          </div>
          <div className="relative mt-12 grid items-stretch gap-5 lg:grid-cols-2">
            <div aria-hidden className="landing-blob" />
            <div className="flex flex-col rounded-xl border border-card-edge bg-card/95 p-6 shadow-panel md:p-8">
              <div className="flex items-center justify-between gap-3">
                <p className="text-label font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  On the desk
                </p>
                <span className="grid size-8 place-items-center rounded-full bg-approve text-approve-foreground">
                  <Mail className="size-4" aria-hidden />
                </span>
              </div>
              <p className="mt-6 text-interface font-medium">Quote for 40 units by Friday</p>
              <p className="mt-1 text-metadata text-muted-foreground">orders@brightline.example</p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                Maya needs pricing for forty units, delivered to Austin by November 14. The reply
                and the quote form are already waiting on the other side of the desk.
              </p>
              <p className="mt-6 text-metadata text-muted-foreground">
                The demo runs on sample emails. No account needed.
              </p>
            </div>
            <div className="rounded-xl border border-card-edge bg-card/95 p-4 shadow-panel sm:p-6">
              <ProductPreview />
            </div>
          </div>
        </section>

        <section id="why" className="scroll-mt-16 border-t border-border">
          <div className="mx-auto max-w-page px-gutter py-20 md:py-28">
            <Reveal>
              <p className="text-label font-semibold tracking-[0.08em] text-[#5c4d86] uppercase">
                What you get back
              </p>
              <h2 className="mt-2 max-w-2xl font-display text-3xl leading-tight font-semibold tracking-[-0.02em] text-balance md:text-4xl">
                Approve the send. Keep the evening.
              </h2>
              <p className="mt-4 max-w-xl font-display text-lg text-[#5c4d86]">
                “The draft can wait. Your name on it should not be a surprise.”
              </p>
            </Reveal>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {benefits.map((benefit) => (
                <Reveal key={benefit.kicker}>
                  <article className="h-full rounded-2xl border border-card-edge bg-card/90 p-6 shadow-panel">
                    <p className="text-label font-semibold tracking-[0.08em] text-[#6d5b9a] uppercase">
                      {benefit.kicker}
                    </p>
                    <h3 className="mt-3 font-display text-xl leading-snug font-semibold tracking-tight">
                      {benefit.title}
                    </h3>
                    <p className="mt-3 text-muted-foreground">{benefit.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Section id="how-it-works" eyebrow="How it works" title="Set up in three steps">
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, body }, index) => (
              <li
                key={title}
                className="rounded-lg border border-card-edge bg-card p-6 shadow-panel md:p-7"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-full bg-approve text-approve-foreground">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="text-label font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section
          id="features"
          eyebrow="Features"
          title="Everything an email needs, in one place"
          description="Open your inbox to a short list of what matters, with the work already started."
        >
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className="rounded-xl border border-card-edge bg-card/95 p-5 shadow-panel"
              >
                <Icon className="size-5 text-muted-foreground" aria-hidden />
                <h3 className="mt-3 font-display text-base font-semibold tracking-tight">
                  {title}
                </h3>
                <p className="mt-2 text-muted-foreground">{body}</p>
              </li>
            ))}
          </ul>
        </Section>

        <section id="control" className="scroll-mt-16">
          <div className="mx-auto grid max-w-page gap-12 px-gutter py-16 md:py-20 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-label font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Your control
              </p>
              <h2 className="mt-2 font-display text-2xl leading-tight font-semibold tracking-[-0.02em] text-balance md:text-3xl">
                Nothing sends without you
              </h2>
              <p className="mt-3 text-base text-muted-foreground">
                The AI prepares the work. You decide what goes out.
              </p>
              <ul className="mt-10 flex flex-col gap-5">
                {promises.map((promise) => (
                  <li key={promise} className="flex gap-3">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-approve text-approve-foreground">
                      <Check className="size-3.5" aria-hidden />
                    </span>
                    {promise}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-card-edge bg-card p-6 shadow-panel md:p-8">
              <h3 className="font-display text-lg font-semibold tracking-tight">
                What we ask Microsoft and Google for
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Only what the inbox needs to work, asked once for each account you connect.
                Disconnecting an account deletes that account's access.
              </p>
              <dl className="mt-4 divide-y divide-border">
                {permissions.map(({ name, why }) => (
                  <div key={name} className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
                    <dt className="font-semibold">{name}</dt>
                    <dd className="text-muted-foreground">{why}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <Section id="faq" eyebrow="FAQ" title="Questions people ask" split>
          <div className="divide-y divide-border border-y border-border">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md font-display text-base font-semibold tracking-tight [&::-webkit-details-marker]:hidden">
                  {q}
                  <ChevronDown
                    className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <p className="mt-3 max-w-2xl text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </Section>

        <section className="mx-auto max-w-page px-gutter pb-24">
          <div className="flex flex-col items-start gap-8 rounded-2xl border border-card-edge bg-card p-8 shadow-panel md:flex-row md:items-center md:justify-between md:p-12">
            <div>
              <h2 className="font-display text-2xl leading-tight font-semibold tracking-[-0.02em] md:text-3xl">
                See it with sample emails
              </h2>
              <p className="mt-2 text-lg text-muted-foreground">
                The demo runs in your browser. Nothing is sent.
              </p>
            </div>
            <CallsToAction />
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-4 px-gutter py-8">
          <Logo />
          <p className="text-metadata text-muted-foreground">
            Nothing sends without your approval.
          </p>
        </div>
      </footer>
    </div>
  )
}

function prefersReducedMotion() {
  return typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
}

const bubbles = [
  { className: 'landing-bubble-a', depth: 0.12 },
  { className: 'landing-bubble-b', depth: 0.22 },
  { className: 'landing-bubble-c', depth: 0.08 },
  { className: 'landing-bubble-d', depth: 0.18 },
]

/** Soft violet bubbles that drift as the page scrolls. */
function ScrollBubbles() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (prefersReducedMotion()) return
    const onScroll = () => {
      const y = window.scrollY
      for (const bubble of node.querySelectorAll<HTMLElement>('[data-depth]')) {
        const depth = Number(bubble.dataset.depth)
        bubble.style.transform = `translate3d(0, ${(-y * depth).toFixed(1)}px, 0)`
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div ref={ref} className="landing-bubbles" aria-hidden="true">
      {bubbles.map((bubble) => (
        <span
          key={bubble.className}
          data-depth={bubble.depth}
          className={cn('landing-bubble', bubble.className)}
        />
      ))}
    </div>
  )
}

/** Fades and rises a block the first time it enters the viewport. */
function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined' || prefersReducedMotion()) {
      setShown(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setShown(true)
        observer.disconnect()
      },
      { threshold: 0.16 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} className={cn('landing-reveal', shown && 'landing-reveal-in', className)}>
      {children}
    </div>
  )
}

function CallsToAction({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {/* Entering the demo changes state, so it isn't preloaded on hover. */}
      <Link to="/demo" preload={false} className={buttonVariants({ size: 'lg' })}>
        Try the demo <ArrowRight />
      </Link>
      <Link to="/sign-in" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
        Sign in
      </Link>
    </div>
  )
}

/** A landing section: heading block, then its content below, or beside it with `split`. */
function Section({
  id,
  eyebrow,
  title,
  description,
  split,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  description?: string
  split?: boolean
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-16 border-t border-border">
      <div
        className={cn(
          'mx-auto max-w-page px-gutter py-20 md:py-28',
          split && 'grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16',
        )}
      >
        <Reveal className="max-w-2xl">
          <p className="text-label font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            {eyebrow}
          </p>
          <h2 className="mt-2 font-display text-3xl leading-tight font-semibold tracking-[-0.02em] text-balance md:text-4xl">
            {title}
          </h2>
          {description && (
            <p className="mt-3 text-base text-muted-foreground md:text-lg">{description}</p>
          )}
        </Reveal>
        <Reveal>{children}</Reveal>
      </div>
    </section>
  )
}
