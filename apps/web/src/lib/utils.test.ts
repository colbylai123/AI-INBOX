import { cn } from './utils'

describe('cn', () => {
  it('keeps the design system text sizes next to a text color', () => {
    expect(cn('text-label text-muted-foreground')).toBe('text-label text-muted-foreground')
  })

  it('still lets a later size win over an earlier one', () => {
    expect(cn('text-interface', 'text-sm')).toBe('text-sm')
    expect(cn('shadow-panel', 'shadow-none')).toBe('shadow-none')
  })
})
