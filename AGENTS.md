# AGENTS.md

Instructions for coding agents (Codex, Claude Code and others) working in this repository.

## The product

An AI inbox for business email. The AI ranks messages, drafts replies and pre-fills forms. A person reviews every draft and form, and nothing is sent until they press **Approve & send**.

## Layout and checks

- `apps/web` is the browser app: Vite, React, TypeScript, TanStack Router and Query, shadcn/ui with Tailwind. See `apps/web/README.md`.
- `apps/api` is reserved for the FastAPI backend.
- `docs/api-contract.md` is the contract between the two, written step by step for the backend developer.
- Run `npm ci && npm run check` in `apps/web` before pushing. It lints, checks formatting, runs the tests and builds, the same as CI.
- Code is grouped by feature in `apps/web/src/features/<area>/{api,hooks,components,lib}`, with route files kept thin.
- Until an endpoint exists, the app runs on the mocks in each feature's `api/mocks.ts`.

## Code Review Rules

- **Nothing sends without a click.** `POST /messages/{id}/approve` is the only call that sends email, and it must run only from the user pressing Approve & send. Flag any shortcut, retry, effect or default that could call it without that click as P0.
- **The contract changes with the code.** If a PR adds or changes an API call, field or response the app relies on, `docs/api-contract.md` must change in the same PR. Flag a mismatch as P1.
- **Optional data never blocks the inbox.** Anything not needed to read and approve email, such as the setup checklist or weekly stats, must load without holding up the page or breaking it when the request fails. Flag a blocking or crashing case as P1.
- **Everything works by keyboard and screen reader.** Interactive elements need an accessible name, at phone width too. Flag a control with no name, or one that can't be reached by keyboard, as P1.
