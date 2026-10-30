import { isDemoMode, mocksEnabled, setDemoMode } from './demo-mode'

vi.mock('./env', () => ({ env: { VITE_USE_MOCKS: false } }))

afterEach(() => setDemoMode(false))

describe('demo mode', () => {
  it('uses the real API until the demo starts', () => {
    expect(mocksEnabled()).toBe(false)
    setDemoMode(true)
    expect(isDemoMode()).toBe(true)
    expect(mocksEnabled()).toBe(true)
  })

  it('remembers the demo for this tab only', () => {
    setDemoMode(true)
    expect(sessionStorage.getItem('demo-mode')).toBe('1')
    setDemoMode(false)
    expect(sessionStorage.getItem('demo-mode')).toBeNull()
    expect(mocksEnabled()).toBe(false)
  })
})
