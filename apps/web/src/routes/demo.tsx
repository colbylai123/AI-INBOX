import { createFileRoute, redirect } from '@tanstack/react-router'
import { resetSampleConnections } from '@/features/connections'
import { resetSampleInbox } from '@/features/inbox'
import { resetSampleMaterials } from '@/features/materials'
import { setDemoMode } from '@/lib/demo-mode'

// "Try the demo": start a fresh sample session and open the inbox. Links here
// set preload={false}, and a preload does nothing, since entering changes state.
export const Route = createFileRoute('/demo')({
  beforeLoad: async ({ context, preload }) => {
    if (preload) return
    await Promise.all([resetSampleInbox(), resetSampleMaterials(), resetSampleConnections()])
    // Forget anything cached from a real session before the sample one starts.
    context.queryClient.clear()
    setDemoMode(true)
    throw redirect({ to: '/inbox' })
  },
})
