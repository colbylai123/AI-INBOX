import { createFileRoute } from '@tanstack/react-router'
import { LandingPage } from '@/features/marketing'

// Public landing page. It makes no API calls, so it loads even when the API is down.
export const Route = createFileRoute('/')({
  component: LandingPage,
})
