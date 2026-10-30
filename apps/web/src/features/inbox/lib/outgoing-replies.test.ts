import {
  connectSender,
  holdSend,
  UNDO_SECONDS,
  undoSend,
  useOutgoingReplies,
} from './outgoing-replies'
import { act, renderHook } from '@testing-library/react'

describe('outgoing replies', () => {
  let disconnect: () => void
  const send = vi.fn(() => Promise.resolve())

  beforeEach(() => {
    vi.useFakeTimers()
    send.mockClear()
    disconnect = connectSender(send)
  })
  afterEach(() => {
    disconnect()
    vi.useRealTimers()
  })

  it('sends only when the undo window ends', () => {
    holdSend('m1', 'a@example.com')
    vi.advanceTimersByTime(UNDO_SECONDS * 1000 - 1)
    expect(send).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(send).toHaveBeenCalledWith('m1')
  })

  it('ignores a second approve while one is held', () => {
    holdSend('m1', 'a@example.com')
    vi.advanceTimersByTime(5000)
    holdSend('m1', 'a@example.com')
    vi.advanceTimersByTime(5000)
    expect(send).toHaveBeenCalledTimes(1)
  })

  it('never sends a reply that was undone', () => {
    holdSend('m1', 'a@example.com')
    undoSend('m1')
    vi.advanceTimersByTime(UNDO_SECONDS * 1000)
    expect(send).not.toHaveBeenCalled()
  })

  it('drops held replies when disconnected, so none sends later', () => {
    const { result } = renderHook(() => useOutgoingReplies())
    act(() => holdSend('m1', 'a@example.com'))
    expect(result.current).toHaveLength(1)
    act(() => disconnect())
    expect(result.current).toHaveLength(0)
    vi.advanceTimersByTime(UNDO_SECONDS * 1000)
    expect(send).not.toHaveBeenCalled()
  })
})
