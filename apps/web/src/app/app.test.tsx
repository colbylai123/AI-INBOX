import { createMemoryHistory } from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { resetMockMessages } from '@/features/inbox/api/mocks'
import { App } from './app'
import { createQueryClient } from './query-client'
import { createAppRouter } from './router'

// Renders the real route tree against the in-memory mocks (.env.test turns them on).
function renderApp(url: string) {
  const queryClient = createQueryClient()
  const router = createAppRouter({
    queryClient,
    history: createMemoryHistory({ initialEntries: [url] }),
  })
  render(<App queryClient={queryClient} router={router} />)
  return router
}

beforeEach(() => resetMockMessages())

describe('app', () => {
  it('redirects / to the inbox, most important first', async () => {
    const router = renderApp('/')
    const items = await screen.findAllByRole('listitem')
    expect(router.state.location.pathname).toBe('/inbox')
    expect(items[0]).toHaveTextContent('RFI #42')
  })

  it('filters by priority from the URL', async () => {
    renderApp('/inbox?priority=low')
    expect(await screen.findByText('This week in construction tech')).toBeInTheDocument()
    expect(screen.queryByText('RFI #42: footing detail at grid C4')).not.toBeInTheDocument()
  })

  it('approves a draft only after an explicit click', async () => {
    renderApp('/inbox/m1')
    const approve = await screen.findByRole('button', { name: 'Approve & send' })
    expect(screen.queryByText('Approved')).not.toBeInTheDocument()
    await userEvent.click(approve)
    expect(await screen.findByText('Approved')).toBeInTheDocument()
  })

  it('shows not found for an unknown message', async () => {
    renderApp('/inbox/does-not-exist')
    expect(await screen.findByText('Not found')).toBeInTheDocument()
  })
})
