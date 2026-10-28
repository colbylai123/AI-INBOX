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

beforeEach(() => {
  resetMockMessages()
  localStorage.clear()
})

describe('app', () => {
  it('redirects / to the inbox, most important first', async () => {
    const router = renderApp('/')
    const items = await screen.findAllByRole('listitem')
    expect(router.state.location.pathname).toBe('/inbox')
    expect(items[0]).toHaveTextContent('Quote for 40 units by Friday')
    // Each row carries the AI's one-line summary.
    expect(items[0]).toHaveTextContent('Wants a quote for 40 units')
  })

  it('filters by priority from the URL', async () => {
    renderApp('/inbox?priority=low')
    expect(await screen.findByText('Five ways to close the month faster')).toBeInTheDocument()
    expect(screen.queryByText('Quote for 40 units by Friday')).not.toBeInTheDocument()
  })

  it('approves a draft only after an explicit click', async () => {
    renderApp('/inbox/m1')
    const approve = await screen.findByRole('button', { name: 'Approve & send' })
    expect(screen.getByRole('button', { name: 'Edit (coming soon)' })).toBeDisabled()
    expect(screen.queryByText('Approved')).not.toBeInTheDocument()
    await userEvent.click(approve)
    expect(await screen.findByText('Approved')).toBeInTheDocument()
  })

  it('shows the AI summary above the conversation', async () => {
    renderApp('/inbox/m2')
    expect(
      await screen.findByText('Reminder that invoice 1182 ($2,400) is due Nov 3.'),
    ).toBeInTheDocument()
  })

  it('follows a same-app sign-in redirect', async () => {
    const router = renderApp('/sign-in?redirect=%2Fsettings')
    await screen.findByRole('heading', { name: 'Settings' })
    expect(router.state.location.pathname).toBe('/settings')
  })

  it('ignores a sign-in redirect that would leave the app', async () => {
    const router = renderApp('/sign-in?redirect=%2F%5Cevil.example')
    await screen.findAllByRole('listitem')
    expect(router.state.location.pathname).toBe('/inbox')
  })

  it('lets the demo banner be dismissed, and remembers it', async () => {
    renderApp('/inbox')
    await userEvent.click(await screen.findByRole('button', { name: 'Dismiss announcement' }))
    expect(screen.queryByRole('region', { name: 'Announcement' })).not.toBeInTheDocument()
    expect(localStorage.getItem('banner:demo-data')).toBe('1')
  })

  it('shows not found for an unknown message', async () => {
    renderApp('/inbox/does-not-exist')
    expect(await screen.findByText('Not found')).toBeInTheDocument()
  })
})
