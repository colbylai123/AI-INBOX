import { createMemoryHistory } from '@tanstack/react-router'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockConnections, resetMockConnections } from '@/features/connections/api/mocks'
import { resetMockMessages } from '@/features/inbox/api/mocks'
import { mockMaterials, resetMockMaterials } from '@/features/materials/api/mocks'
import { ApiError } from '@/lib/api-client'
import { isDemoMode, setDemoMode } from '@/lib/demo-mode'
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
  resetMockConnections()
  localStorage.clear()
  setDemoMode(false)
})

describe('app', () => {
  it('shows the landing page at /', async () => {
    renderApp('/')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Your inbox, sorted and drafted' }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Try the demo/ }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Sign in' }).length).toBeGreaterThan(0)
  })

  it('opens the demo from the landing page and exits back to it', async () => {
    const { router } = renderApp('/')
    const [tryDemo] = await screen.findAllByRole('link', { name: /Try the demo/ })
    await userEvent.click(tryDemo!)

    const bar = await screen.findByRole('region', { name: 'Demo' })
    expect(await screen.findByText('Quote for 40 units by Friday')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/inbox')
    expect(isDemoMode()).toBe(true)
    expect(bar).toHaveTextContent('nothing you approve is sent')
    // The development banner doesn't stack on top of the demo bar.
    expect(screen.queryByRole('region', { name: 'Announcement' })).not.toBeInTheDocument()

    await userEvent.click(within(bar).getByRole('button', { name: 'Exit demo' }))
    await screen.findByRole('heading', { level: 1, name: 'Your inbox, sorted and drafted' })
    expect(router.state.location.pathname).toBe('/')
    expect(isDemoMode()).toBe(false)
  })

  it('starts every demo on fresh sample data', async () => {
    const { router } = renderApp('/demo')
    await userEvent.click(await screen.findByRole('link', { name: /Quote for 40 units/ }))
    await userEvent.click(await screen.findByRole('button', { name: 'Approve & send' }))
    await screen.findByText('Approved')

    await router.navigate({ to: '/demo' })
    await userEvent.click(await screen.findByRole('link', { name: /Quote for 40 units/ }))
    expect(await screen.findByRole('button', { name: 'Approve & send' })).toBeEnabled()
  })

  it('ends the demo when you go to sign in', async () => {
    setDemoMode(true)
    renderApp('/sign-in')
    await screen.findAllByRole('listitem')
    expect(isDemoMode()).toBe(false)
  })

  it('lists the inbox most important first', async () => {
    renderApp('/inbox')
    const items = within(await screen.findByRole('list', { name: 'Messages' })).getAllByRole(
      'listitem',
    )
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
    expect(screen.queryByText('Approved')).not.toBeInTheDocument()
    await userEvent.click(approve)
    expect(await screen.findByText('Approved')).toBeInTheDocument()
    // Once sent, the draft can't be edited any more.
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
  })

  it('shows the form the AI filled in with the draft', async () => {
    renderApp('/inbox/m1')
    const form = await screen.findByRole('region', { name: 'Quote form' })
    expect(within(form).getByText('Quantity').nextSibling).toHaveTextContent('40')
    // A field the AI couldn't fill is called out, not left blank.
    expect(within(form).getByText('Unit price').nextSibling).toHaveTextContent('Not filled')
  })

  it('saves edits to the reply and form before approval', async () => {
    renderApp('/inbox/m1')
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    // Nothing can be sent while editing.
    expect(screen.queryByRole('button', { name: 'Approve & send' })).not.toBeInTheDocument()

    const reply = screen.getByRole('textbox', { name: 'Reply' })
    await userEvent.clear(reply)
    await userEvent.type(reply, 'Quote attached for 45 units.')
    const quantity = screen.getByRole('textbox', { name: 'Quantity' })
    await userEvent.clear(quantity)
    await userEvent.type(quantity, '45')
    await userEvent.type(screen.getByRole('textbox', { name: 'Unit price' }), '$18')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByText('Quote attached for 45 units.')).toBeInTheDocument()
    const form = screen.getByRole('region', { name: 'Quote form' })
    expect(within(form).getByText('Quantity').nextSibling).toHaveTextContent('45')
    expect(within(form).getByText('Unit price').nextSibling).toHaveTextContent('$18')
    expect(screen.getByRole('button', { name: 'Approve & send' })).toBeEnabled()
    expect(screen.queryByText('Approved')).not.toBeInTheDocument()
  })

  it('will not save a blank reply', async () => {
    renderApp('/inbox/m1')
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    const reply = screen.getByRole('textbox', { name: 'Reply' })
    await userEvent.clear(reply)
    await userEvent.type(reply, '   ')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(reply).toBeInvalid()
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument()
  })

  it('throws away edits on cancel', async () => {
    renderApp('/inbox/m1')
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    await userEvent.type(screen.getByRole('textbox', { name: 'Reply' }), ' Extra words.')
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByText(/Extra words/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Approve & send' })).toBeEnabled()
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

  it('shows the connected Outlook account in Settings', async () => {
    renderApp('/settings')
    expect(await screen.findByText('Connected')).toBeInTheDocument()
    expect(screen.getByText(/demo@example.com · Synced/)).toBeInTheDocument()
  })

  it('disconnects Outlook only after confirming, and connects it again', async () => {
    renderApp('/settings')
    await userEvent.click(await screen.findByRole('button', { name: 'Disconnect' }))
    const confirm = screen.getByRole('group', { name: 'Disconnect Outlook?' })
    expect(mockConnections).toHaveLength(1)
    await userEvent.click(within(confirm).getByRole('button', { name: 'Disconnect' }))
    expect(await screen.findByText(/No email connected yet/)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Connect Outlook' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Outlook is connected')
    expect(await screen.findByText('Connected')).toBeInTheDocument()
  })

  it('explains a failed connection', async () => {
    renderApp('/settings?connection=failed')
    expect(await screen.findByRole('alert')).toHaveTextContent("Outlook wasn't connected")
  })

  it('asks to connect Outlook before showing the inbox', async () => {
    mockConnections.splice(0)
    renderApp('/inbox')
    expect(await screen.findByText('Connect Outlook to fill your inbox')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Filter by priority' })).not.toBeInTheDocument()
  })

  it('warns when Outlook needs reconnecting', async () => {
    mockConnections[0]!.status = 'reconnect_needed'
    renderApp('/inbox')
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Outlook needs reconnecting.')
    expect(within(alert).getByRole('button', { name: /Reconnect/ })).toBeEnabled()
  })

  it('signs out to the sign-in page', async () => {
    const { router } = renderApp('/settings')
    await userEvent.click(await screen.findByRole('button', { name: 'Sign out' }))
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/sign-in')
  })

  it('walks a new user through setup until the first approval', async () => {
    const { router } = renderApp('/inbox')
    const setup = await screen.findByRole('region', { name: 'Get set up' })
    expect(setup).toHaveTextContent('2 of 3 done')
    expect(within(setup).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2')

    await userEvent.click(within(setup).getByRole('link', { name: 'Open top email' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Approve & send' }))
    await screen.findByText('Approved')

    await router.navigate({ to: '/inbox' })
    const list = await screen.findByRole('list', { name: 'Messages' })
    // The list refetches after the approval, then marks the row and drops the checklist.
    await waitFor(() =>
      expect(within(list).getAllByRole('listitem')[0]).toHaveTextContent('Approved'),
    )
    expect(screen.queryByRole('region', { name: 'Get set up' })).not.toBeInTheDocument()
  })

  it('asks for a form when nothing is uploaded yet', async () => {
    mockMaterials.splice(0)
    renderApp('/inbox')
    const setup = await screen.findByRole('region', { name: 'Get set up' })
    expect(setup).toHaveTextContent('1 of 3 done')
    expect(within(setup).getByRole('link', { name: 'Go to Materials' })).toBeInTheDocument()
  })

  it('hides the setup checklist when asked, and remembers it', async () => {
    renderApp('/inbox')
    const setup = await screen.findByRole('region', { name: 'Get set up' })
    await userEvent.click(within(setup).getByRole('button', { name: 'Hide' }))
    expect(screen.queryByRole('region', { name: 'Get set up' })).not.toBeInTheDocument()
    expect(localStorage.getItem('getting-started:hidden')).toBe('1')
  })

  it('says why the AI ranked a message', async () => {
    renderApp('/inbox/m1')
    expect(await screen.findByText('Why high')).toBeInTheDocument()
    expect(
      screen.getByText('A customer is asking for a quote with a Friday deadline.'),
    ).toBeInTheDocument()
  })

  it('shows which words of the email each form value came from', async () => {
    renderApp('/inbox/m4')
    const form = await screen.findByRole('region', { name: 'Purchase order' })
    const toggle = within(form).getByRole('button', { name: 'Show sources' })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    expect(document.querySelector('mark')).toBeNull()

    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    expect(within(form).getByText('From the email: “$1.85 each”')).toBeInTheDocument()
    // A value the AI worked out itself is flagged for checking.
    expect(within(form).getByText('Total').nextSibling).toHaveTextContent(
      'Not taken from the email, so check it.',
    )
    // The same words are marked in the email itself.
    const marked = [...document.querySelectorAll('mark')].map((mark) => mark.textContent)
    expect(marked).toContain('$1.85 each')
    expect(marked).toContain('the week of November 10')
  })

  it('stops citing the email for a value the user changed', async () => {
    renderApp('/inbox/m1')
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    const quantity = screen.getByRole('textbox', { name: 'Quantity' })
    await userEvent.clear(quantity)
    await userEvent.type(quantity, '45')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    const form = await screen.findByRole('region', { name: 'Quote form' })
    await userEvent.click(within(form).getByRole('button', { name: 'Show sources' }))
    expect(within(form).getByText('Quantity').nextSibling).toHaveTextContent(
      'Not taken from the email',
    )
    expect(within(form).getByText('Item').nextSibling).toHaveTextContent(
      'From the email: “the standard package”',
    )
  })

  it('shows the time saved once drafts are approved', async () => {
    const { router } = renderApp('/inbox')
    await screen.findByRole('list', { name: 'Messages' })
    expect(screen.queryByRole('region', { name: 'Last 7 days' })).not.toBeInTheDocument()

    await router.navigate({ to: '/inbox/$messageId', params: { messageId: 'm1' } })
    await userEvent.click(await screen.findByRole('button', { name: 'Approve & send' }))
    await screen.findByText('Approved')
    await router.navigate({ to: '/inbox' })

    const week = await screen.findByRole('region', { name: 'Last 7 days' })
    // One reply with a form: 4 + 6 minutes.
    expect(within(week).getByText('Drafts approved').nextSibling).toHaveTextContent('1')
    expect(within(week).getByText('Forms filled').nextSibling).toHaveTextContent('1')
    expect(within(week).getByText('Time saved (est.)').nextSibling).toHaveTextContent('10 min')
  })

  it('moves through the inbox with j and k', async () => {
    renderApp('/inbox')
    const list = await screen.findByRole('list', { name: 'Messages' })
    const links = within(list).getAllByRole('link')
    await userEvent.keyboard('j')
    expect(links[0]).toHaveFocus()
    await userEvent.keyboard('jj')
    expect(links[2]).toHaveFocus()
    await userEvent.keyboard('k')
    expect(links[1]).toHaveFocus()
  })

  it('edits with e and goes back with Escape, but never approves from the keyboard', async () => {
    const { router } = renderApp('/inbox/m1')
    await screen.findByRole('button', { name: 'Approve & send' })
    await userEvent.keyboard('e')
    expect(screen.getByRole('textbox', { name: 'Reply' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await userEvent.keyboard('as')
    expect(screen.queryByText('Approved')).not.toBeInTheDocument()

    await userEvent.keyboard('{Escape}')
    await screen.findByRole('list', { name: 'Messages' })
    expect(router.state.location.pathname).toBe('/inbox')
  })

  it('lists the shortcuts on ?', async () => {
    const { router } = renderApp('/inbox/m1')
    await screen.findByRole('button', { name: 'Approve & send' })
    await userEvent.keyboard('?')
    const help = screen.getByRole('dialog', { name: 'Keyboard shortcuts' })
    expect(help).toHaveTextContent('Edit the draft')
    expect(within(help).getByRole('button', { name: 'Close' })).toHaveFocus()
    // Escape closes the list without also leaving the page.
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/inbox/m1')
  })

  it('shows not found for an unknown message', async () => {
    renderApp('/inbox/does-not-exist')
    expect(await screen.findByText('Not found')).toBeInTheDocument()
  })
})
