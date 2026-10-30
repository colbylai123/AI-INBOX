import { render } from '@testing-library/react'
import { findSpans, highlight } from './highlight'

describe('findSpans', () => {
  it('finds each phrase in order and ignores missing ones', () => {
    const text = 'Send 40 units to Austin by November 14.'
    expect(findSpans(text, ['November 14', '40 units', 'Denver'])).toEqual([
      { start: 5, end: 13 },
      { start: 27, end: 38 },
    ])
  })

  it('keeps the first of two overlapping phrases', () => {
    expect(findSpans('200 medium shipping boxes', ['medium shipping', '200 medium'])).toEqual([
      { start: 0, end: 10 },
    ])
  })

  it("doesn't match inside a longer number or word", () => {
    const text = 'We had 1200 last year, 1,200 in spring, and need 200 now.'
    const start = text.lastIndexOf('200')
    expect(findSpans(text, ['200'])).toEqual([{ start, end: start + 3 }])
    expect(findSpans('Mayan art for Maya', ['Maya'])).toEqual([{ start: 14, end: 18 }])
  })

  it('still matches phrases that begin or end with punctuation', () => {
    expect(findSpans('at $1.85 each.', ['$1.85 each'])).toEqual([{ start: 3, end: 13 }])
  })

  it('ignores blank phrases', () => {
    expect(findSpans('anything', ['', '  '])).toEqual([])
  })
})

describe('highlight', () => {
  it('marks the phrases and keeps the rest of the text', () => {
    const { container } = render(<p>{highlight('Quote for 40 units by Friday', ['40 units'])}</p>)
    expect(container.textContent).toBe('Quote for 40 units by Friday')
    expect(container.querySelector('mark')?.textContent).toBe('40 units')
  })
})
