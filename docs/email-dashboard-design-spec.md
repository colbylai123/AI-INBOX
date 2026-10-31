# Email Management Dashboard redesign

**Status:** Spec for implementation. No backend work.
**Product:** AI Inbox (name not final). A person reviews a draft and approves it before it sends.
**Reference:** [Email Management Dashboard (Dark Mode)](https://dribbble.com/shots/25233648-Email-Management-Dashboard-Dark-Mode) by Adeyemi Mathew. The Dribbble page shows the same frame twice. Build the full desktop frame (the lower one), not the cropped teaser above it.
**Do not substitute** his other shots, “Email Management Dashboard Exploration” and “Hero Section of an Email Management Website.”

Dark mode is that frame. Light mode is the same frame with the surfaces flipped. Do not design a second layout.

The shot’s window title is a placeholder wordmark (it reads as “Ritemail”). Use this product’s wordmark in that slot. Do not ship the placeholder name, and do not copy the shot’s sample mail (Reddit, Netflix, Quora, and the rest).

## Frame

One rounded window on a dark field, like a desktop browser.

- Top left: traffic-light dots, then back and forward.
- Center: a small lock and the product wordmark.
- Top right: refresh, then the window controls.
- Left: a narrow icon rail. The mail icon is the selected one, set in a darker rounded square. This product’s rail is only Inbox (mail, selected), Materials, and Settings, in that icon-only style. Do not add the shot’s extra icons (charts, home, an eye) as new pages.
- The rest of the window is one darker canvas holding two rounded cards with a small gap: the list on the left, the open message on the right. Cards are a step lighter than the canvas. Corners are large.

Sampled from the shot, not from a source file: canvas about `#1F1F1F`, cards about `#2B2B2B` to `#333333`, primary pill about `#9078C8`, the check mark a bright blue near `#4DA8F0`. Match these by looking at the shot. Do not swap in the app’s cobalt or the approve green.

## Top of the canvas

- A search field across the content width. Placeholder: “Search email or name…”. A small filter icon sits inside the right end. This is the existing inbox search.
- Under it, one row. First, a violet pill with a pencil icon and the words **New email**. It does not start a message and it does not send. It opens the selected draft, or the first message that has one.
- Then the folder chips, each with a small icon: **Inbox** with a count, **Sent items**, **Drafts**, **Favorites**, **Archive**, **Deleted**, **Spam**, **Junk**. Inbox is the active chip. Wire Inbox to the message list, Sent items to approved sends, and Drafts to messages that have a draft. The other chips stay in the row. If a message has no field for that chip, the chip shows an empty list. Do not add an API to invent folders.
- At the right of that row the shot has a second violet pill, “Upgrade plan,” and an avatar. This product has no plan to sell. Keep the avatar (the signed-in person). Put the existing light/dark toggle in the pill’s place, same size and violet. The label is **Light** or **Dark**, whichever the control will switch to.

## List card

A quiet “Inbox” label, then rows:

- A round mark at the left.
- Sender name, time at the right (`23:14`).
- Email address under the name, muted.
- Subject in a stronger weight.
- One-line preview, muted, truncated.

The open message’s row is the selected one. The shot draws a blue check beside some names. This product has no verified-sender data, so leave the check off. Do not draw a fake one.

Priority and account filters that already exist sit in the search field’s filter control. Do not add a new bar for them.

## Reading pane

Same card, right side.

- A short icon row: clock, tag, trash, archive. Trash and archive only do something if the message can be removed from the current list in the client. They never send.
- At the right, the position in the list (“3 of 12”, the way the shot shows “150 from 7,689”) and the existing previous/next controls.
- Sender row: round mark, name, address, full date (`Oct 25, 2024 23:14`), then star, a reply arrow, and a more icon. Star is local to the browser. It is not a new server field.
- Subject, large.
- The incoming body.
- Under the body, the draft, still inside this card, labeled **Draft**. Editable with the existing save. Saving never sends.
- An attachment block only when the message actually has a file: file icon, name, size. The shot’s green “Attachment secure by data.ai” line is the designer’s sample. Do not add data.ai. Omit the block when there is no file.
- The bottom row of the card is where the shot puts **Reply**, **Forward**, and **Get link**. **Reply** becomes **Approve & send**, and it uses the violet pill, the only primary button in the shot. It runs the existing flow: hold for 10 seconds with undo in that same row, then send, then show **Sent** in that row. Do not navigate away. Forward and Get link stay as quiet text buttons beside it. Forward does not send. Get link copies the address of this message. If either cannot be done for real, leave it out. Do not add a dead control, and do not add a new column for approval.

## Light mode

Same regions, type sizes, radii, and components. The canvas and cards become off-white. Cards get a hairline border so they still separate. Text is near black, secondary text is gray, and the violet pills stay violet. The existing `data-theme` switch on the document drives it. Light is still the default.

## Small screens

The rail becomes a single icon row. The two cards stack, list first, message under it. The folder chips scroll sideways. Nothing in the approve flow moves to a new page.

## What stays

- Routes stay `/`, `/inbox`, `/materials`, `/settings`.
- Nothing sends without Approve & send, and the 10-second undo still wraps that request.
- Demo data stays demo data. No new endpoint and no new dependency.
- Keyboard and screen-reader names stay on every control.

## Stack

`apps/web` only: Vite, React, TypeScript, TanStack Router and Query, Tailwind, the existing button primitives. The signed-in screen starts at the first paint of `/inbox`. The public page is a different spec and a different palette.
