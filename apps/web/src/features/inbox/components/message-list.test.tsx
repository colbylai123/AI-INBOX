import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import { mockMessages } from '../api/mocks'
import { MessageList } from './message-list'

// Links need a router; this renders the component inside a minimal one.
function renderWithRouter(ui: React.ReactNode) {
  const router = createRouter({
    routeTree: createRootRoute({ component: () => ui }),
    history: createMemoryHistory(),
  })
  return render(<RouterProvider router={router} />)
}

describe('MessageList', () => {
  it('renders each message subject', async () => {
    renderWithRouter(<MessageList messages={mockMessages} />)
    for (const m of mockMessages) {
      expect(await screen.findByText(m.subject)).toBeInTheDocument()
    }
  })

  it('shows an empty state', async () => {
    renderWithRouter(<MessageList messages={[]} />)
    expect(await screen.findByText('No messages yet.')).toBeInTheDocument()
  })
})
