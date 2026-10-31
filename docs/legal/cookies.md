# Cookie and Tracking Disclosure

**Draft for counsel review. Not legal advice.**
**Product:** AI Inbox (name not final)
**Last updated:** October 30, 2026

This page says what AI Inbox stores in the browser, and what it does not. It is part of the Privacy Policy. Questions go to [privacy@example.com].

The first release does not run an advertising network and does not sell personal information. The current web app does not load a third-party analytics script such as Google Analytics. Do not claim that it does until one is actually added. If one is added, update the “Product analytics” section, name the provider, and change the date at the top before you publish.

## Strictly necessary: the session cookie

Sign-in is handled by our API through WorkOS. After you sign in, the API sets a session cookie so the browser can stay signed in. The browser sends that cookie with requests to the API. The page itself does not receive your WorkOS token or your Microsoft or Google mailbox token.

This cookie is required for a signed-in product. If you block it, you cannot stay signed in. Signing out clears it. It is not used to advertise to you.

Before launch, fill in the real cookie name, lifetime, and flags from the API (for example HttpOnly, Secure, SameSite): [session cookie name, lifetime, and flags].

## Saved on your device, not sent as a tracker

The app stores a few of your own interface choices in the browser:

- Whether you dismissed the demo banner (`localStorage`).
- Whether you dismissed the getting-started panel (`localStorage`).
- Whether this tab is in the demo (`sessionStorage`). Demo mode ends when the tab’s session storage is cleared.

Those values are not advertising identifiers. Clearing site data for this site removes them.

## Cloudflare

The site is hosted on Cloudflare. Cloudflare may process IP address and request data to deliver the site and to resist abuse, and it may set its own cookies for that purpose. That processing is described in Cloudflare’s privacy policy. We do not use Cloudflare to build an advertising profile.

## Product analytics

**Not enabled in this release.** No analytics vendor is named in the app, and no analytics cookie is set by our code today.

If we later turn on product analytics, we will use it only to understand the Service: for example, which screens are opened and whether a feature fails. We will not use it to sell data, and we will not use it to advertise to you on other sites. We will name the provider in this section, say what it stores, and say how long it keeps it:

- Provider: [none in this release]
- What it would collect: [pages and feature events, not mailbox contents]
- How to opt out: [browser control or in-product switch]

Mailbox contents, drafts, and uploaded files are not analytics events. They are processed as the Privacy Policy describes, to show your inbox and to prepare summaries, drafts, and forms.

## What we do not do

We do not use cross-site advertising cookies. We do not allow ad networks to follow you through the Service. We do not sell personal information.

## Your choices

You can block or delete cookies and site data in your browser. Blocking the session cookie means the signed-in Service will not work. Blocking Cloudflare’s security cookies may make the site fail its abuse checks. The preference values above can be cleared with the browser’s site-data controls.

If a law where you live requires a consent banner before optional analytics, we will not turn on optional analytics until that banner exists. Strictly necessary sign-in storage does not wait on that banner.
