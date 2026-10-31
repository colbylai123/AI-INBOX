import { applyStoredTheme, getTheme, setTheme } from './theme'

describe('theme', () => {
  beforeEach(() => {
    localStorage.clear()
    applyStoredTheme()
  })

  it('starts light, the look the app was designed in', () => {
    expect(getTheme()).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('remembers dark for the next visit', () => {
    setTheme('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
    // As on the next page load.
    applyStoredTheme()
    expect(getTheme()).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('still switches for this visit when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('private mode')
    })
    setTheme('dark')
    expect(getTheme()).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    vi.restoreAllMocks()
  })
})
