import { formatMinutes, minutesSaved } from './time-saved'

describe('time saved', () => {
  it('counts replies and forms', () => {
    expect(minutesSaved({ draftsApproved: 18, formsApproved: 7 })).toBe(18 * 4 + 7 * 6)
  })

  it('reads as hours and minutes', () => {
    expect(formatMinutes(10)).toBe('10 min')
    expect(formatMinutes(60)).toBe('1 h')
    expect(formatMinutes(130)).toBe('2 h 10 min')
  })
})
