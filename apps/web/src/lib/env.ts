import { z } from 'zod/mini'

// Every VITE_* variable the app reads is declared and validated here, once.
// Defaults live in .env / .env.[mode]; a bad value fails at startup, not mid-session.
export const envSchema = z.object({
  // http(s) only, so "localhost:8000" without a scheme fails here instead of at the
  // first request. Trailing slashes are dropped so `${VITE_API_URL}/messages` has no "//".
  VITE_API_URL: z.pipe(
    z.url({ protocol: /^https?$/ }),
    z.transform((url) => url.replace(/\/+$/, '')),
  ),
  VITE_USE_MOCKS: z.pipe(
    z._default(z.enum(['true', 'false']), 'false'),
    z.transform((v) => v === 'true'),
  ),
})

export const env = envSchema.parse(import.meta.env)
