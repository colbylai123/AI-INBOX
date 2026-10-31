# Landing page redesign

**Status:** Spec for implementation. Public page only.
**Product:** AI Inbox (name not final). A person reviews a draft and approves it before it sends.
**Public reference:** Bloom, “Mental Health Clinic Web Design – Bloom” by Phenomenon Studio, and the case study at https://phenomenonstudio.com/projects/bloom-a-booking-ready-front-door-for-a-mental-health-clinic-that-hadnt-launched-yet
**Product reference, after sign-in:** `docs/email-dashboard-design-spec.md`

The public page uses the Bloom composition. The signed-in product uses the Adeyemi dashboard. Do not blend the two palettes on one screen.

## Hero

One rounded white frame on a soft field. Inside the frame, a full-bleed pastel scene: lavender fog, gold and purple ground, a warm accent, the way Bloom’s landscape sits in its frame. Do not paste Bloom’s artwork or the word Bloom. Use original art or a CSS scene in that palette.

- Top left: the product wordmark.
- Top nav, quiet type: How it works, Features, Your control, FAQ. These are the service links. On a small screen they collapse into a menu.
- Top right: a muted pill, the visual twin of Bloom’s “Book Consultation” pill. The label is **Try the demo**.
- Center: a huge stacked headline. Suggested lines: “Read it.” / “Approve it.” / “Then it sends.” The middle line is lighter, the way Bloom fades “Perfect”.
- One sentence under the headline about reviewing a reply before it sends.
- A white pill button with a lime-green arrow. The arrow moves on hover (shift a few pixels along the arrow direction, then back). The label is **Try the demo**.

## Interactive panel

Bottom of the hero, or over the lower part of the scene: one dark card, the way Lodge Booking and Bloom put the action on the scene. It is a live demo of approve-and-send, not a real mailbox.

1. The card shows a short sample message, a one-line summary, and a draft.
2. The primary control is **Approve & send**.
3. On click, the form is replaced in the same card by a confirmation: “Ready to send” and an undo control. Do not route to another page. Do not leave a static picture of a form.
4. If undo is pressed, the card returns to the draft. If the short hold ends, the card shows “Sent” in the same card.

This swap is required. A screenshot of the card is not an implementation.

## Motion that is required

Do not ship a static hero.

- Hover on nav links: color and a small underline or opacity change.
- Hover on both pills: slight lift and a background change. Respect `prefers-reduced-motion` by dropping the lift and keeping the color change.
- Lime-green arrow: the hover shift above. It is always visible, not only on hover.
- Scroll: the headline, the sentence, and the action card each fade and rise into place as they enter. One short distance, no parallax carnival.
- The in-card swap is a short crossfade, not a full-page transition.

## After the hero

A “What you get back” band comes next: how the draft helps, why the evening is lighter, and the time estimate already used in the app (about 4 minutes a reply, about 6 more when a form is filled). Say it is an estimate. Then the current story, in this order: how it works, features, your control (no auto-send, 10-second undo, disconnect), FAQ.

As the page scrolls, sections fade and rise a short distance, eased so they settle rather than snap. Soft violet bubbles follow the scroll with a lag, and the shape behind the hero card drifts slowly. The hero copy and the card ease in on load. The move into the inbox is a 1.2 second lavender fade with a faint frame, not a hard cut. Inside the app, a new page, a folder or priority change, and an opened email each fade in over a short rise. Do not paste another product’s artwork. Copy must mention Outlook and Gmail and more than one account. A pricing block can be a single quiet placeholder: “Pricing is not set for this release.” Do not invent prices.

## Palette

- Field and scene: lavender, soft gold, warm white. Not the app’s cobalt dashboard.
- Frame: white, large radius.
- Muted pill: a dusty lavender fill, light label.
- Arrow: lime green, close to Bloom’s arrow.
- Action card: near-black text on a dark translucent card, one white button.

## Where the dashboard starts

“Try the demo” opens the existing demo inbox. The move is an animation, not a cut: a lavender field covers the page, a rounded dark frame eases in, and both fade to leave the inbox. From the end of that animation, the screen is the Email Management Dashboard spec, dark or light according to the existing theme control. The lavender does not stay inside the app.
