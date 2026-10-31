import { Link } from '@tanstack/react-router'
import {
  Check,
  ChevronDown,
  FileText,
  ListOrdered,
  PenLine,
  Plug,
  Send,
  Sparkles,
  Upload,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Logo } from '@/components/layout/logo'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { usePageTitle } from '@/lib/use-page-title'
import { cn } from '@/lib/utils'
import { Hero, HeroHeader } from './hero'
import { ArrowPill } from './pills'
import { Reveal } from './reveal'
import { ScrollBubbles } from './scroll-bubbles'

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
  usePageTitle()
  return (
    // Clipped so the scene's glow never scrolls the page sideways on phones.
    <div className="relative min-h-svh overflow-x-clip bg-background" data-surface="marketing">
      <ScrollBubbles />
      <HeroHeader />

      {/* Positioned, so the page sits over the bubbles behind it. */}
      <main className="relative">
        <Hero />

        <section id="why" className="scroll-mt-6">
          <div className="mx-auto max-w-page px-gutter py-20 md:py-28">
            <Reveal>
              <p className="text-label font-semibold tracking-[0.08em] text-[var(--lp-violet-ink)] uppercase">
                What you get back
              </p>
              <h2 className="mt-2 max-w-2xl font-display text-3xl leading-tight font-semibold tracking-[-0.03em] text-balance md:text-4xl">
                Approve the send. Keep the evening.
              </h2>
              <p className="mt-4 max-w-xl font-display text-lg text-[var(--lp-violet-ink)]">
                “The draft can wait. Your name on it should not be a surprise.”
              </p>
            </Reveal>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {benefits.map((benefit, index) => (
                <Reveal key={benefit.kicker} delay={index * 100}>
                  <article className="h-full rounded-[28px] bg-card p-6 shadow-panel md:p-7">
                    <p className="text-label font-semibold tracking-[0.08em] text-[var(--lp-violet-ink)] uppercase">
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
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, body }, index) => (
              <li key={title} className="rounded-[28px] bg-card p-6 shadow-panel md:p-7">
                <div className="flex items-center justify-between">
                  <IconMark icon={Icon} />
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
              <li key={title} className="rounded-[28px] bg-card p-6 shadow-panel">
                <IconMark icon={Icon} />
                <h3 className="mt-4 font-display text-base font-semibold tracking-tight">
                  {title}
                </h3>
                <p className="mt-2 text-muted-foreground">{body}</p>
              </li>
            ))}
          </ul>
        </Section>

        <section id="control" className="scroll-mt-6">
          <div className="mx-auto grid max-w-page gap-12 px-gutter py-16 md:py-20 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-label font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Your control
              </p>
              <h2 className="mt-2 font-display text-3xl leading-tight font-semibold tracking-[-0.03em] text-balance md:text-4xl">
                Nothing sends without you
              </h2>
              <p className="mt-3 text-base text-muted-foreground">
                The AI prepares the work. You decide what goes out.
              </p>
              <ul className="mt-10 flex flex-col gap-5">
                {promises.map((promise) => (
                  <li key={promise} className="flex gap-3">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[var(--lp-lime)] text-[var(--lp-on-lime)]">
                      <Check className="size-3.5" aria-hidden />
                    </span>
                    {promise}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[28px] bg-card p-6 shadow-panel md:p-8">
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

        {/* No prices are set yet, so none are shown. */}
        <section aria-labelledby="pricing-heading" className="border-t border-border">
          <div className="mx-auto flex max-w-page flex-wrap items-baseline gap-x-6 gap-y-1 px-gutter py-10">
            <h2 id="pricing-heading" className="font-display text-lg font-semibold tracking-tight">
              Pricing
            </h2>
            <p className="text-muted-foreground">Pricing is not set for this release.</p>
          </div>
        </section>

        <section className="mx-auto max-w-page px-gutter pb-20">
          <div className="flex flex-col items-start gap-8 rounded-[32px] bg-[linear-gradient(160deg,var(--lp-sky-top),var(--lp-sky)_55%,var(--lp-fog))] p-8 md:flex-row md:items-center md:justify-between md:p-12">
            <div>
              <h2 className="font-display text-3xl leading-tight font-semibold tracking-[-0.03em] md:text-4xl">
                See it with sample emails
              </h2>
              <p className="mt-2 text-lg text-[var(--lp-ink-soft)]">
                The demo runs in your browser. Nothing is sent.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <ArrowPill />
              <Link
                to="/sign-in"
                className="rounded-md text-interface font-medium text-[var(--lp-ink-soft)] underline decoration-transparent decoration-1 underline-offset-[6px] transition-[color,text-decoration-color] hover:text-[var(--lp-ink)] hover:decoration-current"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-4 px-gutter py-8">
          <Logo />
          <div className="flex items-center gap-4">
            <p className="text-metadata text-muted-foreground">
              Nothing sends without your approval.
            </p>
            <ThemeToggle />
          </div>
        </div>
      </footer>
    </div>
  )
}

/** A round dusty-lavender mark behind a section icon. */
function IconMark({ icon: Icon }: { icon: typeof Plug }) {
  return (
    <span className="grid size-10 place-items-center rounded-full bg-primary-soft text-[var(--lp-ink)]">
      <Icon className="size-5" aria-hidden />
    </span>
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
    <section id={id} className="scroll-mt-6 border-t border-border">
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
          <h2 className="mt-2 font-display text-3xl leading-tight font-semibold tracking-[-0.03em] text-balance md:text-4xl">
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
