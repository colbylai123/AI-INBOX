import { createMemoryHistory } from '@tanstack/react-router'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { resetMockMessages } from '@/features/inbox/api/mocks'
import { resetMockMaterials } from '@/features/materials/api/mocks'
import { ApiError } from '@/lib/api-client'
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
  return { router, queryClient }
}

beforeEach(() => {
  resetMockMessages()
  resetMockMaterials()
  localStorage.clear()
})

describe('app', () => {
  it('redirects / to the inbox, most important first', async () => {
    const { router } = renderApp('/')
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
    // Only the chosen filter is marked as selected, not "All" as well.
    const filters = screen.getByRole('navigation', { name: 'Filter by priority' })
    const selected = within(filters)
      .getAllByRole('link')
      .filter((link) => link.getAttribute('aria-current') === 'page')
    expect(selected.map((link) => link.textContent)).toEqual(['Low'])
  })

  it('approves a draft only after an explicit click', async () => {
    renderApp('/inbox/m1')
    const approve = await screen.findByRole('button', { name: 'Approve & send' })
    expect(screen.getByRole('button', { name: 'Edit (coming soon)' })).toBeDisabled()
    expect(screen.queryByText('Approved')).not.toBeInTheDocument()
    await userEvent.click(approve)
    expect(await screen.findByText('Approved')).toBeInTheDocument()
  })

  it('shows the form the AI filled in with the draft', async () => {
    renderApp('/inbox/m1')
    const form = await screen.findByRole('region', { name: 'Quote form' })
    expect(within(form).getByText('Quantity').nextSibling).toHaveTextContent('40')
    // A field the AI couldn't fill is called out, not left blank.
    expect(within(form).getByText('Unit price').nextSibling).toHaveTextContent('Not filled')
  })

  it('shows no form when none of the materials fits', async () => {
    renderApp('/inbox/m2')
    await screen.findByRole('button', { name: 'Approve & send' })
    expect(screen.queryByText('Filled by AI')).not.toBeInTheDocument()
  })

  it('shows the AI summary above the conversation', async () => {
    renderApp('/inbox/m2')
    expect(
      await screen.findByText('Reminder that invoice 1182 ($2,400) is due Nov 3.'),
    ).toBeInTheDocument()
  })

  it('uploads and removes materials', async () => {
    renderApp('/materials')
    expect(await screen.findByText('Quote form')).toBeInTheDocument()

    const file = new File(['%PDF'], 'invoice-template.pdf', { type: 'application/pdf' })
    await userEvent.upload(screen.getByLabelText('Choose a file to upload'), file)
    expect(await screen.findByText('invoice-template')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Remove Quote form' }))
    await waitFor(() => expect(screen.queryByText('Quote form')).not.toBeInTheDocument())
  })

  it('refuses file types the AI cannot use', async () => {
    renderApp('/materials')
    const file = new File(['png'], 'photo.png', { type: 'image/png' })
    // applyAccept: false lets the test pick a file the picker would normally hide.
    await userEvent.upload(await screen.findByLabelText('Choose a file to upload'), file, {
      applyAccept: false,
    })
    expect(await screen.findByRole('alert')).toHaveTextContent(
      "photo.png isn't a PDF, Word or Excel file.",
    )
  })

  it('sends an action that finds the session expired to sign-in', async () => {
    const { router, queryClient } = renderApp('/inbox/m1')
    await screen.findByRole('button', { name: 'Approve & send' })
    // Any mutation answering 401, as Approve & send would once the cookie expires.
    const expired = queryClient.getMutationCache().build(queryClient, {
      mutationFn: () => Promise.reject(new ApiError(401, 'Session expired')),
    })
    await expired.execute(undefined).catch(() => {})

    await screen.findByRole('button', { name: /Sign in/ })
    expect(router.state.location.pathname).toBe('/sign-in')
    expect(router.state.location.search).toEqual({ redirect: '/inbox/m1' })
  })

  it('follows a same-app sign-in redirect', async () => {
    const { router } = renderApp('/sign-in?redirect=%2Fsettings')
    await screen.findByRole('heading', { name: 'Settings' })
    expect(router.state.location.pathname).toBe('/settings')
  })

  it('ignores a sign-in redirect that would leave the app', async () => {
    const { router } = renderApp('/sign-in?redirect=%2F%5Cevil.example')
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
