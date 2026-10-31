# AI Inbox business strategy

October 31, 2026

The demo is real. The business is not yet. Do not sell a price. Sell the demo, then earn the right to charge.

## What this product is

AI Inbox is an email client. It drafts a reply and fills a form, and a person approves the send. Nothing goes out before that. It is built for one person on Outlook or Gmail, including more than one account. A shared team inbox does not exist. Messaging apps are not in this plan.

The front end works on demo data. There is no backend, so nobody can sign in, connect a real mailbox, or send a real reply. The demo resets when the page reloads. That is on purpose.

The name “AI Inbox” is a placeholder. The redesign of the public page and the inbox is a spec, not the product you sell. The live demo is the current inbox.

## What to put in front of people

Put the landing page and the working demo online for sales conversations. On the page, the price line stays: “Pricing is not set for this release.” Do not invent a number there.

The person you can talk to is an individual who already uses Outlook or Gmail and wants a draft they approve before it sends, including a reply that fills a form from a file they uploaded.

## Before anyone pays, or connects a real mailbox

Have a lawyer review the privacy policy and the terms. Those drafts are in `docs/`. They are not a sign-off. Fill in the company name and the AI provider. Put both pages on the site, with footer links.

Then start Google’s review for Gmail. It takes weeks, and it needs a live privacy policy. Gmail cannot open to ordinary users without it. Outlook needs a Microsoft app registration. Sign-in needs WorkOS. The model key stays on the server, never in the browser. Host the front end, and use a separate domain for the API when you have one.

The files say nothing about forming an LLC. That step is outside this plan. A lawyer, or the state’s own filing site, is the source for it.

## What to build, in order

The contract is `docs/api-contract.md`. Build the backend in this order. Switch each screen to the real API when its endpoint exists.

1. Sign in, and Outlook. People can enter and see their own mail.
2. Drafts. The summary, the priority, and the reply show up on each message.
3. Approve and send. This is the first time a real message leaves.
4. Forms. Uploaded forms and price lists come back filled in, with the source of each value.
5. Gmail, and more than one account in the same inbox.
6. The weekly time-saved card.

## When to charge

One person. One plan. No free tier. No team price.

Charge only after both of these are true: they have used approve-and-send on real mail for a week, and the model bill for that person is under the price. Until then, do not publish a price.

A free tier is the wrong design. Every draft spends the server key, and the files never say what a draft costs. An unlimited free plan can cost money before you know that number.

A per-seat team price waits until a shared inbox exists. It does not.

WhatsApp, Slack, Telegram, and Discord wait until you decide a later release includes them. Each one is a new connection. None of them is required to charge the first person.

## What similar products charge

These are published prices, not a price for AI Inbox.

- SaneBox is about $9 a month. It sorts mail inside the inbox you already use. It does not draft or send.
- Superhuman Mail is $25 per member per month billed annually, or $30 month to month, for Starter. Business is $33 annually, or $40 month to month.
- Shortwave lists $30, $45, and $120 per seat per month.

AI Inbox, once it sends, sits nearer that full-inbox band than the $9 sorter, because it drafts a reply and fills a form. It does not yet have a shared inbox, so the top of that band is the wrong comparison.

## Why $25 failed the test

$25 a month was considered because it is the bottom of what a full AI inbox already charges. It does not hold.

- **Cost.** Nothing in the files says what a draft or a form fill costs. $25 does not cover the model key until that bill is under $25 for one person.
- **Churn.** Public writeups on Superhuman say a price around $30 for an email client is a leading reason people cancel. They compare it with free Gmail and Outlook. The price feels fair only after a week of real use. AI Inbox cannot produce that week yet.
- **Overlap.** $25 is already Superhuman Starter’s annual price for a finished client. Matching it with a demo is the weak position.

## Risks to watch

- The model bill can eat the fee. You do not know that number yet.
- Buyers compare any email client with free Gmail and Outlook.
- Publishing a full-inbox price before approve-and-send works on real mail repeats the failed $25 test.
- Google’s review is on the calendar, not a switch you flip.
- Another company may build the same approve-before-send flow. The legal notes say the idea itself is not protected.
