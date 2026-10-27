# AI Inbox

AI communication workspace: turns business email into organized work. The AI prioritizes messages, drafts replies and pre-fills documents; a person reviews and approves before anything is sent.

## Repository layout

| Path       | What                                                                                 |
| ---------- | ------------------------------------------------------------------------------------ |
| `apps/web` | Browser app: Vite + React + TypeScript. See [apps/web/README.md](apps/web/README.md) |
| `apps/api` | FastAPI backend (not added yet)                                                      |

One repository, so a change can update the API and the UI together under one set of checks.

The contract between the two, built step by step, is in [docs/api-contract.md](docs/api-contract.md).

## Quick start (web)

```bash
cd apps/web
npm install
npm run dev
```
