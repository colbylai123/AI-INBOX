import type { Message } from '../types'

const seed: Message[] = [
  {
    id: 'm1',
    from: 'orders@brightline.example',
    subject: 'Quote for 40 units by Friday',
    preview: "Hi, we'd like a quote for 40 units of the standard package…",
    summary: 'Wants a quote for 40 units, delivered to Austin by Nov 14. Needs it by Friday.',
    receivedAt: '2026-10-27T14:10:00Z',
    priority: 'high',
    body: "Hi, we'd like a quote for 40 units of the standard package, delivered to our Austin office by November 14. Could you send pricing and lead time by Friday?\n\nThanks,\nMaya",
    draftReply:
      "Hi Maya,\n\nThanks for reaching out. I've attached a quote for 40 units of the standard package with delivery to your Austin office by November 14. Let me know if you'd like to change the quantity.\n\nBest,",
    filledForm: {
      materialId: 'mat-quote',
      name: 'Quote form',
      fields: [
        { id: 'customer', label: 'Customer', value: 'Brightline' },
        { id: 'contact', label: 'Contact', value: 'Maya, orders@brightline.example' },
        { id: 'item', label: 'Item', value: 'Standard package' },
        { id: 'quantity', label: 'Quantity', value: '40' },
        { id: 'deliver-to', label: 'Deliver to', value: 'Austin office' },
        { id: 'deliver-by', label: 'Deliver by', value: 'November 14, 2026' },
      ],
    },
    approvedAt: null,
  },
  {
    id: 'm2',
    from: 'billing@harborsupply.example',
    subject: 'Invoice 1182 due next week',
    preview: 'A reminder that invoice 1182 for $2,400 is due on November 3…',
    summary: 'Reminder that invoice 1182 ($2,400) is due Nov 3.',
    receivedAt: '2026-10-27T11:02:00Z',
    priority: 'medium',
    body: 'A reminder that invoice 1182 for $2,400 is due on November 3. Reply to this email if you need another copy.',
    draftReply:
      'Thanks for the reminder. We have invoice 1182 on file and will pay it by November 3.',
    filledForm: null,
    approvedAt: null,
  },
  {
    id: 'm3',
    from: 'newsletter@example.com',
    subject: 'Five ways to close the month faster',
    preview: 'This week: what small teams are doing to speed up month-end…',
    summary: 'Newsletter. No reply needed.',
    receivedAt: '2026-10-26T08:30:00Z',
    priority: 'low',
    body: 'This week: what small teams are doing to speed up month-end.',
    draftReply: null,
    filledForm: null,
    approvedAt: null,
  },
]

// In-memory "database" so mutations behave realistically during development.
export let mockMessages: Message[] = structuredClone(seed)

export function resetMockMessages() {
  mockMessages = structuredClone(seed)
}
