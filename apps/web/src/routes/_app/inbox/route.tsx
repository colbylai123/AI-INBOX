import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod/mini'
import { priorities } from '@/features/inbox'

// The list's filters and search, declared on the parent of both the list and each
// message, so opening a message and going back keeps them (/inbox/m1?q=quote).
export const Route = createFileRoute('/_app/inbox')({
  // Typed, validated URL state. Unknown values fall back to "all".
  validateSearch: z.object({
    priority: z.catch(z.optional(z.enum(priorities)), undefined),
    // Search words. The list is filtered in the browser, so they aren't a loader dep.
    q: z.catch(z.optional(z.string()), undefined),
    // One account's mail, by connection id. Also filtered in the browser.
    account: z.catch(z.optional(z.string()), undefined),
  }),
})
