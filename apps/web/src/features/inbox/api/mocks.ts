import type { Message } from '../types'

const seed: Message[] = [
  {
    id: 'm1',
    from: 'site-super@example.com',
    subject: 'RFI #42: footing detail at grid C4',
    preview: 'Need clarification on the rebar spacing before Thursday pour…',
    receivedAt: '2026-10-25T14:10:00Z',
    priority: 'high',
    body: 'Need clarification on the rebar spacing before Thursday pour. Drawing S-201 conflicts with the spec.',
    draftReply:
      'Thanks, we are reviewing S-201 against the spec and will confirm by Wednesday noon.',
    approvedAt: null,
  },
  {
    id: 'm2',
    from: 'supplier@example.com',
    subject: 'Updated quote for drywall',
    preview: 'Attached is the revised quote reflecting the new quantities…',
    receivedAt: '2026-10-25T11:02:00Z',
    priority: 'medium',
    body: 'Attached is the revised quote reflecting the new quantities.',
    draftReply: null,
    approvedAt: null,
  },
  {
    id: 'm3',
    from: 'newsletter@example.com',
    subject: 'This week in construction tech',
    preview: 'Five tools worth a look this month…',
    receivedAt: '2026-10-24T08:30:00Z',
    priority: 'low',
    body: 'Five tools worth a look this month.',
    draftReply: null,
    approvedAt: null,
  },
]

// In-memory "database" so mutations behave realistically during development.
export let mockMessages: Message[] = structuredClone(seed)

export function resetMockMessages() {
  mockMessages = structuredClone(seed)
}
