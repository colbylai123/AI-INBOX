import { z } from 'zod'

// Every VITE_* variable the app reads is declared and validated here, once.
// Defaults live in .env / .env.[mode]; a bad value fails at startup, not mid-session.
const schema = z.object({
  VITE_API_URL: z.url(),
  VITE_USE_MOCKS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
})

export const env = schema.parse(import.meta.env)
