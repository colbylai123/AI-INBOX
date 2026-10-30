import type { MessageSummary } from '../types'
import { searchMessages } from './search'

const msg = (id: string, fields: Partial<MessageSummary>) =>
  ({
    id,
    from: '',
    subject: '',
    preview: '',
    summary: null,
    receivedAt: '2026-10-30T10:00:00Z',
    priority: 'low',
    priorityReason: null,
    hasDraft: false,
    approvedAt: null,
    ...fields,
  }) satisfies MessageSummary

const messages = [
  msg('quote', { from: 'orders@brightline.example', subject: 'Quote for 40 units' }),
  msg('invoice', { from: 'billing@harbor.example', summary: 'Invoice 1042 is overdue' }),
  msg('cafe', { subject: 'Lunch at Café Rosa', preview: 'Booked for Friday' }),
]
const ids = (query: string | undefined) => searchMessages(messages, query).map((m) => m.id)

describe('searchMessages', () => {
  it('returns everything for an empty query', () => {
    expect(ids(undefined)).toEqual(['quote', 'invoice', 'cafe'])
    expect(ids('   ')).toEqual(['quote', 'invoice', 'cafe'])
  })

  it('matches the sender, subject, summary and preview, ignoring case', () => {
    expect(ids('BRIGHTLINE')).toEqual(['quote'])
    expect(ids('overdue')).toEqual(['invoice'])
    expect(ids('friday')).toEqual(['cafe'])
  })

  it('needs every word, in any order', () => {
    expect(ids('units quote')).toEqual(['quote'])
    expect(ids('quote invoice')).toEqual([])
  })

  it('ignores accents', () => {
    expect(ids('cafe')).toEqual(['cafe'])
  })
})
