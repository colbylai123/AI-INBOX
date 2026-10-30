# AI Inbox — web app

The browser app for AI Inbox. A static React app (deployed to Cloudflare Pages) whose only backend is FastAPI.

**Stack:** Vite · React 19 · TypeScript (strict) · TanStack Router (file-based) · TanStack Query · Tailwind CSS v4 · shadcn/ui · Zod · Vitest + Testing Library · oxlint · Prettier

## Getting started

```bash
cd apps/web
nvm use            # Node 22 (see .nvmrc)
npm install
npm run dev        # http://localhost:5173, runs on mock data, no backend needed
```

| Script            | What it does                                          |
| ----------------- | ----------------------------------------------------- |
| `npm run dev`     | Dev server with router + query devtools, mock data on |
| `npm run build`   | Production build to `dist/`, then type check          |
| `npm run test`    | Vitest in watch mode                                  |
| `npm run lint`    | oxlint                                                |
| `npm run format`  | Prettier (also sorts Tailwind classes)                |
| `npm run check`   | Everything CI runs: lint, format, tests, build        |
| `npm run gen:api` | Generate API types from FastAPI's `/openapi.json`     |

## Environment

| File               | Loaded in     | Purpose                                |
| ------------------ | ------------- | -------------------------------------- |
| `.env`             | every mode    | Safe defaults (`VITE_USE_MOCKS=false`) |
| `.env.development` | `npm run dev` | Turns mocks on                         |
| `.env.test`        | tests         | Turns mocks on                         |
| `.env.local`       | your machine  | Personal overrides, gitignored         |

To run the dev server against a real API, put `VITE_USE_MOCKS=false` in `.env.development.local`. A plain `.env.local` loses to `.env.development` in dev mode.

Every variable is declared and validated in `src/lib/env.ts`. `VITE_*` values ship to the browser, so never put secrets in them. In Cloudflare Pages, set `VITE_API_URL` to the production API.

## Link previews and installing

- **Link previews.** `index.html` has the Open Graph tags, and `public/og-image.png` is the image. Previews need absolute URLs, so `vite.config.ts` adds `og:url` and `og:image` when the build knows the site's address. In Cloudflare Pages, set `SITE_URL` to the real domain, such as `https://app.example.com`. Without it, Pages builds use the deployment's own URL. This is a build setting, not a `VITE_*` variable.
- **Add to home screen.** `public/manifest.webmanifest` and the icons let phones and desktop Chrome install the app. It opens on `/inbox`.
- **Changing the name, logo or headline.** Edit `scripts/share-images.html`, then run `node scripts/render-share-images.mjs` to redraw the preview image and icons (needs Playwright: `npx playwright install chromium`). `public/favicon.svg` is drawn by hand and matches the logo in `components/layout/logo.tsx`.

## Demo mode

Visitors can click **Try the demo** on the landing page to use the app on the sample data in `features/*/api/mocks.ts` without signing in. `/demo` resets the sample data, clears the query cache and turns demo mode on for this browser tab (`lib/demo-mode.ts`, kept in `sessionStorage`). While it's on, every API function answers from the mocks, exactly as in development, so a demo never calls the real API and nothing is sent. A dark bar on every page says so, with **Sign in to use your inbox** and **Exit demo**. Visiting `/sign-in` also ends the demo.

Because the demo runs on the mocks, keep them realistic: they are what prospects see.

## Folder structure

```
src/
  app/                  App wiring: <App>, router factory, query client factory
  routes/               Pages. File path = URL (TanStack Router file-based routing)
    __root.tsx          Root layout + dev-only devtools
    index.tsx           Public landing page (makes no API calls)
    demo.tsx            /demo: starts "Try the demo" and opens the inbox
    _app.tsx            Signed-in area: auth guard + app shell (top nav)
    _app/inbox/         /inbox (?priority=…) and /inbox/$messageId
    _app/materials.tsx  /materials
    _app/settings.tsx   /settings
    sign-in.tsx         Public sign-in page (ends a demo)
  features/             One folder per product area
    auth/               Session query, sign-in URL, session expiry, User type
    connections/        Connected email accounts: connect, reconnect, disconnect (step 5)
    marketing/          Landing page and the public site header
    onboarding/         Getting-started checklist at the top of the inbox
    inbox/
      api/              inbox-api.ts (HTTP or mocks), queries.ts (keys + queryOptions), mocks.ts
      hooks/            Mutations and other hooks (useApproveDraft)
      components/       Components only this feature uses
      lib/              Pure logic + its tests (sortByPriority)
      types.ts
      index.ts          The feature's public exports
    materials/
  components/
    ui/                 shadcn/ui primitives
    layout/             App shell (top nav), demo bar, page header, logo, dismissible banner
    feedback/           Default error, loading and not-found screens
  lib/                  Framework-free helpers: api client, env, demo mode, cn(), mock delay
  styles/               Tailwind entry + Software design tokens (--dp-*)
  test/                 Test setup
public/_headers         Cloudflare Pages security and cache headers (set the Pages root directory to apps/web)
public/manifest.webmanifest, *.png  Install info, icons and the link preview image
scripts/                Renders the preview image and icons
```

`src/routeTree.gen.ts` is regenerated by the router plugin on `dev` and `build`. Commit it, don't edit it.

## Conventions

- **Routes stay thin.** A route file declares its URL params, search params and loader, then renders feature components. Logic lives in `features/`.
- **Import features through their `index.ts`.** Use `@/features/inbox`, never deep paths. If two features need the same thing, move it to `components/` or `lib/`. oxlint blocks import cycles.
- **Server data goes through TanStack Query.** Each feature has three layers:
  1. `api/<feature>-api.ts`: plain async functions that call `apiFetch` (or the mocks).
  2. `api/queries.ts`: query keys and `queryOptions`. Routes preload them in `loader` with `ensureQueryData`; components read them with `useSuspenseQuery`.
  3. `hooks/`: `useMutation` hooks that invalidate the right keys on success.
- **URL state is typed.** Filters and other shareable state go in search params, validated with Zod in `validateSearch` (see `routes/_app/inbox/index.tsx`).
- **Errors and loading are handled once.** The router's default error, pending and not-found components cover every route. A loader turns an API 404 into `notFound()`, and any 401 (session expired) sends the user to sign-in and back to the same page.
- **Auth is a route guard.** `_app.tsx` checks the session in `beforeLoad` and redirects to `/sign-in?redirect=…`. Put any new signed-in page under `routes/_app/`. The browser never holds WorkOS or Microsoft tokens; FastAPI owns them.
- **One HTTP entry point.** `lib/api-client.ts` is the only place that calls `fetch`. When the backend is running, `npm run gen:api` writes `src/lib/api-schema.gen.ts`; then replace the hand-written shapes in `features/*/types.ts` with the generated ones.
- **Nothing sends without approval.** The AI only drafts. Any action that sends or finalizes must be an explicit user click (see `DraftReview`).
- **Tests sit next to the code** as `*.test.ts(x)`. `src/app/app.test.tsx` renders the whole app on mocks; use it as the template for page-level tests.
- **UI primitives come from shadcn/ui.** Add more with `npx shadcn@latest add dialog` (config in `components.json`). The look follows the **Software** design system: a light ground, dark bold headings and electric blue for actions, small icons and selected states. Its authoritative tokens are the `--dp-*` variables in `styles/globals.css`. Components use only the shadcn role colors mapped onto them (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-muted`, `bg-primary`, `bg-primary-soft`, `bg-field`), so a future restyle changes `globals.css`, not components. Fonts are Host Grotesk (`font-display`, headings) and Instrument Sans (body, labels, controls), self-hosted via Fontsource. Type sizes beyond Tailwind's are `text-interface` (15px), `text-metadata` (13px) and `text-label` (12px); `cn()` knows them, so they survive class merging. Rules of thumb: blue only for actions, small icons and selected states (selected controls also get `aria-current`); 12px radius and `shadow-panel` for cards, 8px for controls; buttons lift a pixel on hover only with `motion-safe:`, so reduced motion has no movement; no glows, glass or decorative motion.

## Adding a page

1. Create `src/routes/_app/<name>.tsx` with `createFileRoute('/_app/<name>')`. The plugin registers it and it's automatically behind sign-in.
2. Put its API calls, queries, hooks and components in `src/features/<name>/`, exported from `index.ts`.
3. Add a nav entry in `components/layout/app-shell.tsx`.
4. Add a test next to the code, or a case in `src/app/app.test.tsx`.

## Backend endpoints the app expects

The endpoints, JSON shapes and backend requirements (CORS, `return_to` validation, error codes) are in [docs/api-contract.md](../../docs/api-contract.md), the shared agreement with the FastAPI backend. It's split into the same steps as the front-end work. Mocks in `features/*/api/mocks.ts` follow those shapes until each endpoint exists, so update both together.
