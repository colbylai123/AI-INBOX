import { isSafeRedirectPath } from './safe-redirect'

describe('isSafeRedirectPath', () => {
  it.each(['/', '/inbox', '/inbox?priority=high', '/inbox/m1#draft'])('allows %s', (path) => {
    expect(isSafeRedirectPath(path)).toBe(true)
  })

  it.each([
    'https://evil.example',
    'evil.example',
    '//evil.example',
    '/\\evil.example',
    '\\/evil.example',
    '/\t/evil.example',
    '/\n/evil.example',
    'javascript:alert(1)',
    '',
  ])('rejects %j', (path) => {
    expect(isSafeRedirectPath(path)).toBe(false)
  })
})
