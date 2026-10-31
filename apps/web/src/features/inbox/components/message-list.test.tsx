import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('shows an empty state that says what will arrive, with no made-up actions', async () => {
    renderWithRouter(<MessageList messages={[]} />)
    expect(await screen.findByText('No messages yet')).toBeInTheDocument()
    expect(screen.getByText(/Nothing is sent until you approve it/)).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it("doesn't call a filtered list an empty inbox", async () => {
    renderWithRouter(<MessageList messages={[]} filtered />)
    expect(await screen.findByText('No messages match these filters')).toBeInTheDocument()
    expect(screen.queryByText('No messages yet')).not.toBeInTheDocument()
  })
})

describe('a long inbox', () => {
  const many = Array.from({ length: 500 }, (_, i) => ({
    ...mockMessages[i % mockMessages.length]!,
    id: `bulk-${i}`,
    subject: `Message ${i + 1}`,
    account: { id: 'con-2', email: 'demo@gmail.example' },
  }))

  // jsdom has no layout or scrolling: give rows (and the list card) a height, and let
  // scrollTo move the list and tell listeners, as a browser would.
  // The list's first guess at a row's height, so every row is where it expects.
  const rowHeight = 104
  const scroller = () => screen.getByRole('list', { name: 'Messages' }).parentElement!
  const scrollTo = function (this: Element, options: ScrollToOptions) {
    Object.defineProperty(this, 'scrollTop', { value: options.top ?? 0, configurable: true })
    this.dispatchEvent(new Event('scroll'))
  }
  const scrollList = (top: number) => act(() => scrollTo.call(scroller(), { top }))
  const originalScrollTo = Element.prototype.scrollTo
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(rowHeight)
    vi.spyOn(Element.prototype, 'scrollHeight', 'get').mockReturnValue(500 * rowHeight)
    Element.prototype.scrollTo = scrollTo as typeof Element.prototype.scrollTo
  })
  afterEach(() => {
    Element.prototype.scrollTo = originalScrollTo
    vi.restoreAllMocks()
  })

  const rows = () => within(screen.getByRole('list', { name: 'Messages' })).getAllByRole('listitem')
  const focusedRow = () => document.activeElement?.closest('li')

  it('renders only the rows near the screen, and says how many there are in all', async () => {
    renderWithRouter(<MessageList messages={many} showAccount />)
    await screen.findByText('Message 1')
    expect(rows().length).toBeLessThan(30)
    expect(rows()[0]).toHaveAttribute('aria-posinset', '1')
    expect(rows()[0]).toHaveAttribute('aria-setsize', '500')
    // The account line is still on each row.
    expect(rows()[0]).toHaveTextContent('to demo@gmail.example')
    expect(screen.queryByText('Message 400')).not.toBeInTheDocument()

    await scrollList(400 * rowHeight)
    expect(await screen.findByText('Message 401')).toBeInTheDocument()
    expect(screen.queryByText('Message 1')).not.toBeInTheDocument()
  })

  it('moves with j and k past the rows that were rendered', async () => {
    renderWithRouter(<MessageList messages={many} />)
    await screen.findByText('Message 1')
    for (let i = 0; i < 40; i++) await userEvent.keyboard('j')
    await waitFor(() => expect(focusedRow()).toHaveAttribute('aria-posinset', '40'))
    expect(focusedRow()).toHaveTextContent('Message 40')
    await userEvent.keyboard('k')
    await waitFor(() => expect(focusedRow()).toHaveAttribute('aria-posinset', '39'))
  })

  it('keeps the focused row in the page when you scroll away from it', async () => {
    renderWithRouter(<MessageList messages={many} />)
    await screen.findByText('Message 1')
    await userEvent.keyboard('jjj')
    expect(focusedRow()).toHaveTextContent('Message 3')

    await scrollList(300 * rowHeight)
    await screen.findByText('Message 301')
    expect(focusedRow()).toHaveTextContent('Message 3')
    // j carries on from the focused row, not from where the page is.
    await userEvent.keyboard('j')
    await waitFor(() => expect(focusedRow()).toHaveTextContent('Message 4'))
  })
})
