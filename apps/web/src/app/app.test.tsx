import { createMemoryHistory } from '@tanstack/react-router'
import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockConnections, resetMockConnections } from '@/features/connections/api/mocks'
import { mockMessages, resetMockMessages } from '@/features/inbox/api/mocks'
import { mockMaterials, resetMockMaterials } from '@/features/materials/api/mocks'
import * as sessionApi from '@/features/auth/api/session'
import * as connectionsApi from '@/features/connections/api/connections-api'
import * as inboxApi from '@/features/inbox/api/inbox-api'
import { UNDO_SECONDS } from '@/features/inbox/lib/outgoing-replies'
import * as materialsApi from '@/features/materials/api/materials-api'
import { ApiError } from '@/lib/api-client'
import { isDemoMode, setDemoMode } from '@/lib/demo-mode'
import { applyStoredTheme } from '@/lib/theme'
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

// Approve & send holds a reply for the undo window, so tests that send skip past it.
// Fake timers that still run in real time, so everything else waits as normal.
function fakeClock() {
  vi.useFakeTimers({
    shouldAdvanceTime: true,
    toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'],
  })
}
const waitOutUndo = () => act(() => vi.advanceTimersByTimeAsync(UNDO_SECONDS * 1000))

// The priority and account filters sit behind the filter button in the search field.
const openFilters = () => userEvent.click(screen.getByRole('button', { name: /^Filters/ }))

async function approveAndSend() {
  fakeClock()
  await userEvent.click(await screen.findByRole('button', { name: 'Approve & send' }))
  await waitOutUndo()
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

beforeEach(() => {
  resetMockMessages()
  resetMockMaterials()
  resetMockConnections()
  localStorage.clear()
  applyStoredTheme()
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

  it('names Gmail and several accounts on the landing page, like Settings', async () => {
    renderApp('/')
    const faq = await screen.findByText('Which email accounts work?')
    expect(faq.closest('details')).toHaveTextContent(/Outlook and Gmail.*more than one account/)
    expect(screen.getByText(/Disconnect any account at any time/)).toHaveTextContent(
      "that account's access is deleted",
    )
    expect(
      screen.getByRole('heading', { name: 'What we ask Microsoft and Google for' }),
    ).toBeInTheDocument()
    expect(screen.queryByText(/Disconnect Outlook/)).not.toBeInTheDocument()
    // Still no shared team inbox.
    expect(
      screen.getByText('Can my whole team share one inbox?').closest('details'),
    ).toHaveTextContent('Not yet')
  })

  it('opens the section links from a menu button on small screens', async () => {
    renderApp('/')
    const menu = await screen.findByRole('button', { name: 'Page sections' })
    expect(menu).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(menu)
    expect(menu).toHaveAttribute('aria-expanded', 'true')
    const panel = document.getElementById(menu.getAttribute('aria-controls')!)!
    expect(
      within(panel)
        .getAllByRole('link')
        .map((link) => [link.textContent, link.getAttribute('href')]),
    ).toEqual([
      ['How it works', '#how-it-works'],
      ['Features', '#features'],
      ['Your control', '#control'],
      ['FAQ', '#faq'],
      // Shown only on the narrowest phones, where the header's Sign in is hidden.
      ['Sign in', '/sign-in'],
    ])

    // Following a link closes it.
    await userEvent.click(within(panel).getByRole('link', { name: 'FAQ' }))
    expect(menu).toHaveAttribute('aria-expanded', 'false')
    expect(panel).not.toBeInTheDocument()

    // Escape closes it and puts focus back on the button.
    await userEvent.click(menu)
    await userEvent.tab()
    await userEvent.keyboard('{Escape}')
    expect(menu).toHaveAttribute('aria-expanded', 'false')
    expect(menu).toHaveFocus()

    // So does a tap elsewhere on the page.
    await userEvent.click(menu)
    await userEvent.click(screen.getByRole('heading', { level: 1 }))
    expect(menu).toHaveAttribute('aria-expanded', 'false')

    // Tabbing past the last link closes it, and Escape still lands back on the button.
    await userEvent.click(menu)
    const items = within(document.getElementById(menu.getAttribute('aria-controls')!)!)
    const stops = items.getAllByRole('link').length + items.getAllByRole('button').length
    for (let i = 0; i < stops; i++) await userEvent.tab()
    await userEvent.tab()
    expect(menu).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(menu)
    ;(document.activeElement as HTMLElement).blur()
    await userEvent.keyboard('{Escape}')
    expect(menu).toHaveAttribute('aria-expanded', 'false')
    expect(menu).toHaveFocus()
  })

  it('switches to the dark theme and remembers it', async () => {
    renderApp('/inbox')
    await screen.findByRole('list', { name: 'Messages' })
    // The app's pill is labeled with the theme it switches to.
    await userEvent.click(screen.getByRole('button', { name: 'Dark mode' }))
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(screen.getByRole('button', { name: 'Light mode' })).toBeInTheDocument()

    // The landing page follows the choice too. Its toggle is a pressed button.
    cleanup()
    renderApp('/')
    expect(await screen.findByRole('button', { name: 'Dark mode' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Dark mode' }))
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(localStorage.getItem('theme')).toBe('light')
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
    await approveAndSend()
    await screen.findByText('Sent')

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
    expect(screen.getByRole('button', { name: 'Filters, on' })).toBeInTheDocument()
    await openFilters()
    const filters = screen.getByRole('navigation', { name: 'Filter by priority' })
    const selected = within(filters)
      .getAllByRole('link')
      .filter((link) => link.getAttribute('aria-current') === 'page')
    expect(selected.map((link) => link.textContent)).toEqual(['Low'])
  })

  it('approves a draft only after an explicit click', async () => {
    const approve = vi.spyOn(inboxApi, 'approveDraft')
    renderApp('/inbox/m1')
    await screen.findByRole('button', { name: 'Approve & send' })
    expect(screen.queryByText('Sent')).not.toBeInTheDocument()
    await approveAndSend()
    expect(await screen.findByText('Sent')).toBeInTheDocument()
    expect(approve).toHaveBeenCalledTimes(1)
    // Once sent, the draft can't be edited any more.
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
  })

  it('holds a reply for the undo window, and undo means it never sends', async () => {
    const approve = vi.spyOn(inboxApi, 'approveDraft')
    fakeClock()
    renderApp('/inbox/m1')
    await userEvent.click(await screen.findByRole('button', { name: 'Approve & send' }))
    expect(screen.getByRole('button', { name: 'Sends in 10s' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Undo' })).toHaveFocus()
    expect(approve).not.toHaveBeenCalled()

    await act(() => vi.advanceTimersByTimeAsync(4000))
    expect(screen.getByRole('button', { name: 'Sends in 6s' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitOutUndo()
    expect(approve).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Approve & send' })).toBeEnabled()
    expect(screen.queryByText('Sent')).not.toBeInTheDocument()
  })

  it('keeps the undo window while you move on, then sends', async () => {
    fakeClock()
    const { router } = renderApp('/inbox/m1')
    await userEvent.click(await screen.findByRole('button', { name: 'Approve & send' }))
    await router.navigate({ to: '/inbox' })
    const notice = await screen.findByText(/sends in/)
    expect(notice).toHaveTextContent('Reply to orders@brightline.example sends in')
    expect(notice.closest('[role="status"]')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument()

    await waitOutUndo()
    expect(await screen.findByText(/Reply sent to/)).toHaveTextContent(
      'Reply sent to orders@brightline.example',
    )
    const list = screen.getByRole('list', { name: 'Messages' })
    await waitFor(() => expect(within(list).getAllByText('Reply sent')).toHaveLength(1))
  })

  it('says when a reply could not be sent, and lets you try again', async () => {
    vi.spyOn(inboxApi, 'approveDraft').mockRejectedValueOnce(new ApiError(500, 'Down'))
    renderApp('/inbox/m1')
    await approveAndSend()
    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't send. Please try again.")
    await approveAndSend()
    expect(await screen.findByText('Sent')).toBeInTheDocument()
  })

  it('drops a held reply as soon as you sign out, even if signing out is slow', async () => {
    const approve = vi.spyOn(inboxApi, 'approveDraft')
    fakeClock()
    // Logout takes longer than the rest of the undo window.
    vi.spyOn(sessionApi, 'signOut').mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, UNDO_SECONDS * 2000)),
    )
    const { router } = renderApp('/inbox/m1')
    await userEvent.click(await screen.findByRole('button', { name: 'Approve & send' }))
    await router.navigate({ to: '/settings' })
    await userEvent.click(await screen.findByRole('button', { name: 'Sign out' }))
    await waitOutUndo()
    expect(approve).not.toHaveBeenCalled()
    await act(() => vi.advanceTimersByTimeAsync(UNDO_SECONDS * 1000))
    await screen.findByRole('heading', { name: 'Sign in' })
    expect(approve).not.toHaveBeenCalled()
  })

  it('never offers Approve again for a reply that sent while you were away', async () => {
    fakeClock()
    const { router } = renderApp('/inbox/m1')
    await userEvent.click(await screen.findByRole('button', { name: 'Approve & send' }))
    await router.navigate({ to: '/inbox' })
    await waitOutUndo()
    await screen.findByText(/Reply sent to/)

    // The draft page was cached before the send. It must come back already approved.
    await router.navigate({ to: '/inbox/$messageId', params: { messageId: 'm1' } })
    await screen.findByRole('heading', { name: 'Quote for 40 units by Friday' })
    expect(screen.queryByRole('button', { name: 'Approve & send' })).not.toBeInTheDocument()
    expect(screen.getByText('Sent')).toBeInTheDocument()
  })

  it('shows the form the AI filled in with the draft', async () => {
    renderApp('/inbox/m1')
    const form = await screen.findByRole('region', { name: 'Quote form' })
    expect(within(form).getByText('Quantity').nextSibling).toHaveTextContent('40')
    // A field the AI couldn't fill is called out, not left blank.
    expect(within(form).getByText('Lead time').nextSibling).toHaveTextContent('Not filled')
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
    await userEvent.type(screen.getByRole('textbox', { name: 'Lead time' }), '2 weeks')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByText('Quote attached for 45 units.')).toBeInTheDocument()
    const form = screen.getByRole('region', { name: 'Quote form' })
    expect(within(form).getByText('Quantity').nextSibling).toHaveTextContent('45')
    expect(within(form).getByText('Lead time').nextSibling).toHaveTextContent('2 weeks')
    expect(screen.getByRole('button', { name: 'Approve & send' })).toBeEnabled()
    expect(screen.queryByText('Sent')).not.toBeInTheDocument()
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

  it('shows the AI summary above the email', async () => {
    renderApp('/inbox/m2')
    const email = await screen.findByRole('article', { name: 'Invoice 1182 due next week' })
    expect(
      within(email).getByText('Reminder that invoice 1182 ($2,400) is due Nov 3.'),
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

  it('shows the connected accounts in Settings', async () => {
    renderApp('/settings')
    expect(await screen.findByText(/demo@example.com · Synced/)).toBeInTheDocument()
    expect(screen.getByText(/demo@gmail.example · Synced/)).toBeInTheDocument()
    expect(screen.getAllByText('Connected')).toHaveLength(2)
  })

  it('disconnects Outlook only after confirming, and connects it again', async () => {
    mockConnections.splice(1)
    renderApp('/settings')
    await userEvent.click(await screen.findByRole('button', { name: 'Disconnect' }))
    const confirm = screen.getByRole('group', { name: 'Disconnect demo@example.com?' })
    expect(mockConnections).toHaveLength(1)
    await userEvent.click(within(confirm).getByRole('button', { name: 'Disconnect' }))
    expect(await screen.findByText(/No email connected yet/)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Connect Outlook' }))
    expect(await screen.findByText(/Outlook is connected/)).toBeInTheDocument()
    expect(await screen.findByText('Connected')).toBeInTheDocument()
  })

  it('explains a failed connection', async () => {
    renderApp('/settings?provider=gmail&connection=failed')
    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Gmail wasn't connected. You may have cancelled, or Google refused access.",
    )
  })

  it('connects a Gmail account alongside Outlook', async () => {
    mockConnections.splice(1)
    const { router } = renderApp('/settings')
    await screen.findByText(/demo@example.com · Synced/)
    await userEvent.click(screen.getByRole('button', { name: 'Connect Gmail' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Gmail is connected')
    expect(await screen.findByText(/demo@gmail.example · Synced/)).toBeInTheDocument()
    expect(screen.getByText(/demo@example.com · Synced/)).toBeInTheDocument()
    expect(mockConnections.map((c) => c.provider)).toEqual(['outlook', 'gmail'])
    expect(router.state.location.search).toEqual({ provider: 'gmail', connection: 'connected' })
  })

  it('says so beside the button when connecting fails before leaving the page', async () => {
    vi.spyOn(connectionsApi, 'connect').mockRejectedValueOnce(new Error('Chunk failed to load'))
    renderApp('/settings')
    await screen.findByText(/demo@example.com · Synced/)
    await userEvent.click(screen.getByRole('button', { name: 'Connect Gmail' }))
    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't open Google. Try again.")
    expect(screen.getByRole('button', { name: 'Connect Gmail' })).toBeEnabled()

    // Trying again works and clears the error.
    await userEvent.click(screen.getByRole('button', { name: 'Connect Gmail' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Gmail is connected')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('adds a second account from the same provider', async () => {
    mockConnections.splice(1)
    renderApp('/settings')
    await screen.findByText(/demo@example.com · Synced/)
    await userEvent.click(screen.getByRole('button', { name: 'Connect Outlook' }))
    expect(await screen.findByText(/demo2@example.com · Synced/)).toBeInTheDocument()
    expect(screen.getByText(/demo@example.com · Synced/)).toBeInTheDocument()
    expect(mockConnections.map((c) => c.accountEmail)).toEqual([
      'demo@example.com',
      'demo2@example.com',
    ])
  })

  it('reconnects the Outlook row that was clicked when two need reconnecting', async () => {
    mockConnections[0]!.status = 'reconnect_needed'
    mockConnections.push({
      id: 'con-9',
      provider: 'outlook',
      accountEmail: 'other@example.com',
      status: 'reconnect_needed',
      connectedAt: '2026-10-21T16:00:00Z',
      lastSyncedAt: null,
    })
    renderApp('/settings')
    await screen.findByText(/other@example.com/)
    const reconnect = screen.getAllByRole('button', { name: 'Reconnect' })
    expect(reconnect).toHaveLength(2)
    await userEvent.click(reconnect[1]!)
    expect(await screen.findByText(/Outlook is connected/)).toBeInTheDocument()
    expect(mockConnections.find((c) => c.id === 'con-1')?.status).toBe('reconnect_needed')
    expect(mockConnections.find((c) => c.id === 'con-9')?.status).toBe('connected')
  })

  it('reconnects the account that needs it, with its own provider', async () => {
    mockConnections[1]!.status = 'reconnect_needed'
    renderApp('/inbox')
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Gmail needs reconnecting. New mail for demo@gmail.example')
    await userEvent.click(within(alert).getByRole('button', { name: /Reconnect/ }))
    expect(await screen.findByText(/Gmail is connected/)).toBeInTheDocument()
    expect(mockConnections.map((c) => c.status)).toEqual(['connected', 'connected'])
  })

  it('asks to connect Outlook before showing the inbox', async () => {
    mockConnections.splice(0)
    renderApp('/inbox')
    expect(await screen.findByText('Connect your email to fill your inbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Connect Outlook' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Connect Gmail' })).toBeInTheDocument()
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

    await userEvent.click(within(setup).getByRole('link', { name: 'Open the next draft' }))
    await approveAndSend()
    await screen.findByText('Sent')

    await router.navigate({ to: '/inbox' })
    const list = await screen.findByRole('list', { name: 'Messages' })
    // The list refetches after the approval, then marks the row and drops the checklist.
    await waitFor(() =>
      expect(within(list).getAllByRole('listitem')[0]).toHaveTextContent('Reply sent'),
    )
    expect(screen.queryByRole('region', { name: 'Get set up' })).not.toBeInTheDocument()
  })

  it('points the approval step at an email that has a draft', async () => {
    // The most important email has no draft, so the step skips to the next one that does.
    Object.assign(mockMessages[0]!, { draftReply: null, hasDraft: false, filledForm: null })
    renderApp('/inbox')
    const setup = await screen.findByRole('region', { name: 'Get set up' })
    await userEvent.click(within(setup).getByRole('link', { name: 'Open the next draft' }))
    expect(
      await screen.findByRole('heading', { name: 'PO needed for 200 shipping boxes' }),
    ).toBeInTheDocument()
  })

  it('still shows the inbox when the checklist data fails to load', async () => {
    vi.spyOn(materialsApi, 'getMaterials').mockRejectedValue(new ApiError(500, 'Down'))
    renderApp('/inbox?priority=high')
    expect(await screen.findByText('Quote for 40 units by Friday')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Get set up' })).not.toBeInTheDocument()
    vi.restoreAllMocks()
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
      'Not from the email or your documents, so check it.',
    )
    // The same words are marked in the email itself.
    const marked = [...document.querySelectorAll('mark')].map((mark) => mark.textContent)
    expect(marked).toContain('$1.85 each')
    expect(marked).toContain('the week of November 10')
  })

  it("marks a value taken from the sender's address", async () => {
    renderApp('/inbox/m1')
    const form = await screen.findByRole('region', { name: 'Quote form' })
    await userEvent.click(within(form).getByRole('button', { name: 'Show sources' }))
    const marked = [...document.querySelectorAll('mark')].map((mark) => mark.textContent)
    expect(marked).toContain('orders@brightline.example')
  })

  it('quotes the uploaded document a value came from', async () => {
    renderApp('/inbox/m1')
    const form = await screen.findByRole('region', { name: 'Quote form' })
    await userEvent.click(within(form).getByRole('button', { name: 'Show sources' }))
    expect(within(form).getByText('Unit price').nextSibling).toHaveTextContent(
      '$42.00From Price list: “Standard package: $42.00 per unit”',
    )
    // The document's words aren't in the email, so nothing there is marked for them.
    const marked = [...document.querySelectorAll('mark')].map((mark) => mark.textContent)
    expect(marked).not.toContain('Standard package: $42.00 per unit')
    expect(marked).toContain('40 units')
  })

  it('stops citing a document for a value the user changed', async () => {
    renderApp('/inbox/m1')
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    const price = screen.getByRole('textbox', { name: 'Unit price' })
    await userEvent.clear(price)
    await userEvent.type(price, '$39.00')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    const form = await screen.findByRole('region', { name: 'Quote form' })
    await userEvent.click(within(form).getByRole('button', { name: 'Show sources' }))
    expect(within(form).getByText('Unit price').nextSibling).toHaveTextContent(
      '$39.00Not from the email or your documents, so check it.',
    )
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
      'Not from the email or your documents',
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
    await approveAndSend()
    await screen.findByText('Sent')
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
    expect(screen.queryByText('Sent')).not.toBeInTheDocument()

    await userEvent.keyboard('{Escape}')
    await screen.findByRole('list', { name: 'Messages' })
    expect(router.state.location.pathname).toBe('/inbox')
  })

  it('opens the next and previous email with j and k, in the order of the list you came from', async () => {
    const { router } = renderApp('/inbox/m1?q=units')
    await screen.findByRole('heading', { name: 'Quote for 40 units by Friday' })
    // k at the top of the list stays put.
    await userEvent.keyboard('k')
    expect(router.state.location.pathname).toBe('/inbox/m1')

    // The search matched two emails; j skips the ones it didn't match.
    await userEvent.keyboard('j')
    expect(await screen.findByRole('heading', { name: '12 units arrived damaged' })).toBeVisible()
    expect(router.state.location.search).toEqual({ q: 'units' })
    const second = router.state.location.pathname
    // j at the bottom stays put too.
    await userEvent.keyboard('j')
    expect(router.state.location.pathname).toBe(second)

    await userEvent.keyboard('k')
    expect(
      await screen.findByRole('heading', { name: 'Quote for 40 units by Friday' }),
    ).toBeVisible()
    expect(router.state.location.pathname).toBe('/inbox/m1')
  })

  it('walks the same emails as the inbox when the account in the link is no longer connected', async () => {
    // Gmail was disconnected, so ?account=con-2 is stale and the inbox lists every account.
    mockConnections.splice(1)
    renderApp('/inbox/m1?account=con-2')
    await screen.findByRole('heading', { name: 'Quote for 40 units by Friday' })
    await userEvent.keyboard('j')
    expect(
      await screen.findByRole('heading', { name: 'PO needed for 200 shipping boxes' }),
    ).toBeVisible()
  })

  it('jumps to the search with / from an email, which stays open beside it', async () => {
    const { router } = renderApp('/inbox/m1')
    await screen.findByRole('button', { name: 'Approve & send' })
    await userEvent.keyboard('/')
    const search = screen.getByRole('searchbox', { name: 'Search the inbox' })
    await waitFor(() => expect(search).toHaveFocus())
    expect(router.state.location.pathname).toBe('/inbox/m1')
    // The slash itself isn't typed into the box.
    expect(search).toHaveValue('')
  })

  it('saves edits with Ctrl+Enter without sending, and ignores j and k while editing', async () => {
    const approve = vi.spyOn(inboxApi, 'approveDraft')
    const { router } = renderApp('/inbox/m1')
    await screen.findByRole('button', { name: 'Approve & send' })
    await userEvent.keyboard('e')
    const reply = screen.getByRole('textbox', { name: 'Reply' })
    await userEvent.clear(reply)
    await userEvent.type(reply, 'Hi Maya, the quote is attached.')

    // Focus off the fields, as after a click on the page: j and k still do nothing.
    reply.blur()
    await userEvent.keyboard('jk')
    expect(router.state.location.pathname).toBe('/inbox/m1')

    await userEvent.click(reply)
    await userEvent.keyboard('{Control>}{Enter}{/Control}')
    expect(await screen.findByText('Hi Maya, the quote is attached.')).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Reply' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Approve & send' })).toBeEnabled()
    expect(approve).not.toHaveBeenCalled()
  })

  it('lists the shortcuts on ?', async () => {
    const { router } = renderApp('/inbox/m1')
    await screen.findByRole('button', { name: 'Approve & send' })
    await userEvent.keyboard('?')
    const help = screen.getByRole('dialog', { name: 'Keyboard shortcuts' })
    expect(help).toHaveTextContent('Edit the draft')
    for (const group of ['In the inbox', 'On an email', 'Editing a reply', 'Anywhere']) {
      expect(within(help).getByRole('heading', { name: group })).toBeInTheDocument()
    }
    expect(help).toHaveTextContent('Open the next or previous email')
    expect(help).toHaveTextContent('Close the email')
    expect(help).toHaveTextContent(/Ctrl\s*Enter\s*Save your changes|Save your changesCtrlEnter/)
    expect(help).toHaveTextContent('a stray key can never send an email')
    expect(within(help).getByRole('button', { name: 'Close' })).toHaveFocus()
    // Escape closes the list without also leaving the page.
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/inbox/m1')
  })

  it('still shows the inbox when the weekly stats fail to load', async () => {
    vi.spyOn(inboxApi, 'getWeeklyStats').mockRejectedValue(new ApiError(500, 'Down'))
    renderApp('/inbox')
    expect(await screen.findByText('Quote for 40 units by Friday')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Last 7 days' })).not.toBeInTheDocument()
    vi.restoreAllMocks()
  })

  it('searches the inbox and keeps the words in the URL', async () => {
    const { router } = renderApp('/inbox')
    const list = await screen.findByRole('list', { name: 'Messages' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(8)

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search the inbox' }), 'units')
    expect(screen.getByText('2 of 8 messages match')).toBeInTheDocument()
    expect(
      within(list)
        .getAllByRole('listitem')
        .map((li) => li.querySelector('a')!.textContent),
    ).toEqual([
      expect.stringContaining('Quote for 40 units'),
      expect.stringContaining('12 units arrived'),
    ])
    await waitFor(() => expect(router.state.location.search).toEqual({ q: 'units' }))

    // Changing the priority keeps the search.
    await openFilters()
    await userEvent.click(screen.getByRole('link', { name: 'Medium' }))
    await waitFor(() =>
      expect(router.state.location.search).toEqual({ q: 'units', priority: 'medium' }),
    )
    expect(await screen.findByText('No messages match “units”.')).toBeInTheDocument()
  })

  it('keeps the search when you open a message and go back', async () => {
    const { router } = renderApp('/inbox?q=units&priority=high')
    await userEvent.click(await screen.findByRole('link', { name: /Quote for 40 units/ }))
    await screen.findByRole('button', { name: 'Approve & send' })
    expect(router.state.location.search).toEqual({ q: 'units', priority: 'high' })

    // The list stays beside the email, still searched.
    expect(screen.getByText('2 of 3 messages match')).toBeInTheDocument()

    // Escape closes the email and keeps the search.
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(router.state.location.pathname).toBe('/inbox'))
    expect(screen.getByRole('searchbox', { name: 'Search the inbox' })).toHaveValue('units')
    expect(router.state.location.search).toEqual({ q: 'units', priority: 'high' })
  })

  it('jumps to search with / and clears it with Escape', async () => {
    renderApp('/inbox?q=packright')
    const search = await screen.findByRole('searchbox', { name: 'Search the inbox' })
    expect(search).toHaveValue('packright')
    expect(screen.getByText('1 of 8 messages match')).toBeInTheDocument()

    await userEvent.keyboard('/')
    expect(search).toHaveFocus()
    expect(search).toHaveValue('packright')
    await userEvent.keyboard('{Escape}')
    expect(search).toHaveValue('')
    expect(
      within(screen.getByRole('list', { name: 'Messages' })).getAllByRole('listitem'),
    ).toHaveLength(8)
  })

  it('empties the search box when the Inbox link clears the search', async () => {
    renderApp('/inbox?q=invoice')
    const search = await screen.findByRole('searchbox', { name: 'Search the inbox' })
    const nav = screen.getByRole('navigation', { name: 'Main' })
    await userEvent.click(within(nav).getByRole('link', { name: 'Inbox' }))
    await waitFor(() => expect(search).toHaveValue(''))
  })

  it('shows one account at a time, and says which account each email came to', async () => {
    const { router } = renderApp('/inbox')
    const list = await screen.findByRole('list', { name: 'Messages' })
    expect(within(list).getByRole('link', { name: /Quote for 40 units/ })).toHaveTextContent(
      'orders@brightline.example to demo@gmail.example',
    )

    await openFilters()
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Account' }),
      'demo@gmail.example (Gmail)',
    )
    await waitFor(() => expect(router.state.location.search).toEqual({ account: 'con-2' }))
    const rows = within(screen.getByRole('list', { name: 'Messages' })).getAllByRole('listitem')
    expect(rows).toHaveLength(3)
    // They all came to the same account, so the rows don't repeat it.
    expect(rows[0]).not.toHaveTextContent('to demo@gmail.example')

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Account' }), 'All accounts')
    await waitFor(() => expect(router.state.location.search).toEqual({}))
  })

  it('keeps the account when you open a message and go back', async () => {
    const { router } = renderApp('/inbox?account=con-2')
    await userEvent.click(await screen.findByRole('link', { name: /Quote for 40 units/ }))
    const email = await screen.findByRole('article', { name: 'Quote for 40 units by Friday' })
    expect(email).toHaveTextContent('orders@brightline.example to demo@gmail.example')
    expect(router.state.location.search).toEqual({ account: 'con-2' })

    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(router.state.location.pathname).toBe('/inbox'))
    await openFilters()
    expect(screen.getByRole('combobox', { name: 'Account' })).toHaveValue('con-2')
  })

  it('shows every account when the link names one that is not connected', async () => {
    renderApp('/inbox?account=con-gone')
    const list = await screen.findByRole('list', { name: 'Messages' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(8)
    await openFilters()
    expect(screen.getByRole('combobox', { name: 'Account' })).toHaveValue('')
  })

  it('has no account picker with only one account connected', async () => {
    mockConnections.splice(1)
    renderApp('/inbox')
    const list = await screen.findByRole('list', { name: 'Messages' })
    await openFilters()
    expect(screen.queryByRole('combobox', { name: 'Account' })).not.toBeInTheDocument()
    expect(list).not.toHaveTextContent('to demo@')
  })

  it('shows not found for an unknown message', async () => {
    renderApp('/inbox/does-not-exist')
    expect(await screen.findByText('Not found')).toBeInTheDocument()
  })
})

describe('dashboard', () => {
  const rowsOf = () =>
    within(screen.getByRole('list', { name: 'Messages' }))
      .getAllByRole('listitem')
      .map((li) => li.querySelector('a')!.textContent)
  const folder = (name: RegExp | string) =>
    within(screen.getByRole('navigation', { name: 'Folders' })).getByRole('link', { name })

  it('shows the list and the open email side by side, with its place in the list', async () => {
    const { router } = renderApp('/inbox/m4')
    const email = await screen.findByRole('article', { name: 'PO needed for 200 shipping boxes' })
    expect(within(email).getByText('2 of 8')).toBeInTheDocument()
    // The open email's row is marked in the list beside it.
    expect(
      within(screen.getByRole('list', { name: 'Messages' })).getByRole('link', {
        name: /PO needed for 200 shipping boxes/,
      }),
    ).toHaveAttribute('aria-current', 'page')

    await userEvent.click(within(email).getByRole('link', { name: 'Next email' }))
    expect(
      await screen.findByRole('article', { name: '12 units arrived damaged' }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/inbox/m5')
    await userEvent.click(screen.getByRole('link', { name: 'Previous email' }))
    await screen.findByRole('article', { name: 'PO needed for 200 shipping boxes' })
  })

  it('sorts mail into folder chips without sending or changing the mailbox', async () => {
    const approve = vi.spyOn(inboxApi, 'approveDraft')
    const { router } = renderApp('/inbox')
    await screen.findByRole('list', { name: 'Messages' })
    expect(folder(/^Inbox/)).toHaveAccessibleName('Inbox, 8 emails')
    expect(folder(/^Inbox/)).toHaveAttribute('aria-current', 'page')

    // Drafts are the drafted replies still waiting for approval.
    await userEvent.click(folder('Drafts'))
    await waitFor(() => expect(router.state.location.search).toEqual({ folder: 'drafts' }))
    expect(folder('Drafts')).toHaveAttribute('aria-current', 'page')
    expect(folder(/^Inbox/)).not.toHaveAttribute('aria-current')
    expect(rowsOf()).not.toContainEqual(expect.stringContaining('Five ways to close'))

    // Nothing has been sent yet, and nothing marks spam.
    await userEvent.click(folder('Sent items'))
    expect(await screen.findByText('No sent replies yet')).toBeInTheDocument()
    await userEvent.click(folder('Spam'))
    expect(await screen.findByText('Nothing in Spam')).toBeInTheDocument()
    expect(approve).not.toHaveBeenCalled()
  })

  it('archives, deletes and stars in this browser only, and moves mail back', async () => {
    const { router } = renderApp('/inbox/m1')
    const email = await screen.findByRole('article', { name: 'Quote for 40 units by Friday' })

    await userEvent.click(within(email).getByRole('button', { name: 'Star' }))
    expect(within(email).getByRole('button', { name: 'Star' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await userEvent.click(within(email).getByRole('button', { name: 'Archive' }))
    expect(email).toHaveTextContent("Moved to Archive in this browser. Your mailbox isn't changed.")
    // It leaves the inbox list and the chip's count.
    await waitFor(() =>
      expect(rowsOf()).not.toContainEqual(expect.stringContaining('Quote for 40 units')),
    )
    expect(folder(/^Inbox/)).toHaveAccessibleName('Inbox, 7 emails')

    await router.navigate({ to: '/inbox', search: { folder: 'archive' } })
    await waitFor(() => expect(rowsOf()).toEqual([expect.stringContaining('Quote for 40 units')]))
    await router.navigate({ to: '/inbox', search: { folder: 'favorites' } })
    await waitFor(() => expect(rowsOf()).toEqual([expect.stringContaining('Quote for 40 units')]))

    await router.navigate({ to: '/inbox/$messageId', params: { messageId: 'm1' } })
    const again = await screen.findByRole('article', { name: 'Quote for 40 units by Friday' })
    await userEvent.click(within(again).getByRole('button', { name: 'Move back to the inbox' }))
    await waitFor(() => expect(folder(/^Inbox/)).toHaveAccessibleName('Inbox, 8 emails'))
  })

  it('opens a draft from New email, and never sends from it', async () => {
    const approve = vi.spyOn(inboxApi, 'approveDraft')
    const { router } = renderApp('/inbox')
    await screen.findByRole('list', { name: 'Messages' })
    const newEmail = screen.getByRole('button', { name: 'New email' })
    expect(newEmail).toHaveAccessibleDescription(
      'Opens a drafted reply to review. Nothing is sent until you approve it.',
    )

    // With no email open it opens the first one with a draft waiting.
    await userEvent.click(newEmail)
    await screen.findByRole('article', { name: 'Quote for 40 units by Friday' })
    expect(router.state.location.pathname).toBe('/inbox/m1')
    expect(screen.queryByRole('textbox', { name: 'Reply' })).not.toBeInTheDocument()

    // With it open, it opens that draft for editing.
    await userEvent.click(screen.getByRole('button', { name: 'New email' }))
    expect(await screen.findByRole('textbox', { name: 'Reply' })).toHaveFocus()
    expect(approve).not.toHaveBeenCalled()
  })

  it('copies a link to the email, and forwards only through your own email app', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    renderApp('/inbox/m1')
    const email = await screen.findByRole('article', { name: 'Quote for 40 units by Friday' })

    await userEvent.click(within(email).getByRole('button', { name: 'Get link' }))
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/inbox/m1`)
    expect(await within(email).findByText('Link copied')).toBeInTheDocument()
    expect(within(email).getByRole('link', { name: 'Forward' })).toHaveAttribute(
      'href',
      expect.stringMatching(/^mailto:\?subject=Fwd%3A%20Quote%20for%2040%20units/),
    )
  })

  it('goes back and refreshes from the window bar', async () => {
    const getMessages = vi.spyOn(inboxApi, 'getMessages')
    const { router } = renderApp('/inbox')
    await screen.findByRole('list', { name: 'Messages' })
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()

    await userEvent.click(screen.getByRole('link', { name: 'Settings' }))
    await screen.findByRole('heading', { name: 'Settings' })
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/inbox'))

    const calls = getMessages.mock.calls.length
    await userEvent.click(screen.getByRole('button', { name: 'Refresh' }))
    await waitFor(() => expect(getMessages.mock.calls.length).toBeGreaterThan(calls))
  })
})
