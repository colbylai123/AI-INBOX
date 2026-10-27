import { createMemoryHistory } from '@tanstack/react-router'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { resetMockMessages } from '@/features/inbox/api/mocks'
import { resetMockMaterials } from '@/features/materials/api/mocks'
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
  resetMockMaterials()
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
    expect(screen.queryByText('Approved')).not.toBeInTheDocument()
    await userEvent.click(approve)
    expect(await screen.findByText('Approved')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
  })

  it('shows the form the AI filled in with the draft', async () => {
    renderApp('/inbox/m1')
    const form = await screen.findByRole('region', { name: 'Quote form' })
    expect(form).toHaveTextContent('Quantity')
    expect(form).toHaveTextContent('40')
  })

  it('saves edits to the reply and form before approval', async () => {
    renderApp('/inbox/m1')
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    expect(screen.queryByRole('button', { name: 'Approve & send' })).not.toBeInTheDocument()

    const reply = screen.getByRole('textbox', { name: 'Reply' })
    await userEvent.clear(reply)
    await userEvent.type(reply, 'Quote attached for 45 units.')
    const quantity = screen.getByRole('textbox', { name: 'Quantity' })
    await userEvent.clear(quantity)
    await userEvent.type(quantity, '45')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByText('Quote attached for 45 units.')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Quote form' })).toHaveTextContent('45')
    expect(screen.getByRole('button', { name: 'Approve & send' })).toBeEnabled()
  })

  it('throws away edits on cancel', async () => {
    renderApp('/inbox/m1')
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    await userEvent.type(screen.getByRole('textbox', { name: 'Reply' }), ' Extra words.')
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByText(/Extra words/)).not.toBeInTheDocument()
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
