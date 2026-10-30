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
        { id: 'unit-price', label: 'Unit price', value: '' },
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
  {
    id: 'm4',
    from: 'sales@packright.example',
    subject: 'PO needed for 200 shipping boxes',
    preview: 'Following up on our call: to hold the 200 boxes at $1.85 each…',
    summary: 'Needs a purchase order by Nov 5 to hold 200 boxes at $1.85 each.',
    receivedAt: '2026-10-27T09:45:00Z',
    priority: 'high',
    body: "Hi,\n\nFollowing up on our call: to hold the 200 medium shipping boxes at $1.85 each, we'll need a purchase order by November 5. Delivery would be to your main warehouse the week of November 10.\n\nThanks,\nJordan\nPackRight Supply",
    draftReply:
      'Hi Jordan,\n\nThanks for holding the price. Our purchase order for 200 medium shipping boxes at $1.85 each is attached, for delivery to our main warehouse the week of November 10.\n\nBest,',
    filledForm: {
      materialId: 'mat-po',
      name: 'Purchase order',
      fields: [
        { id: 'supplier', label: 'Supplier', value: 'PackRight Supply' },
        { id: 'contact', label: 'Contact', value: 'Jordan, sales@packright.example' },
        { id: 'item', label: 'Item', value: 'Medium shipping boxes' },
        { id: 'quantity', label: 'Quantity', value: '200' },
        { id: 'unit-price', label: 'Unit price', value: '$1.85' },
        { id: 'total', label: 'Total', value: '$370.00' },
        { id: 'deliver-to', label: 'Deliver to', value: 'Main warehouse' },
        { id: 'deliver-by', label: 'Deliver by', value: 'Week of November 10, 2026' },
      ],
    },
    approvedAt: null,
  },
  {
    id: 'm5',
    from: 'ops@lakeviewcafe.example',
    subject: '12 units arrived damaged',
    preview: 'Our delivery came in this morning and 12 of the 50 units were damaged…',
    summary: '12 of 50 units arrived damaged. Wants replacements this week.',
    receivedAt: '2026-10-26T16:20:00Z',
    priority: 'high',
    body: 'Hi,\n\nOur delivery came in this morning and 12 of the 50 units were damaged in transit. Photos attached. Can you send replacements this week?\n\nPriya\nLakeview Cafe',
    draftReply:
      "Hi Priya,\n\nI'm sorry the units arrived damaged, and thanks for the photos. We'll get 12 replacements out to you this week and send tracking as soon as they ship.\n\nBest,",
    filledForm: null,
    approvedAt: null,
  },
  {
    id: 'm6',
    from: 'sam@fieldnotes.example',
    subject: "Can we move Thursday's call?",
    preview: 'Something came up on Thursday. Could we move our 2pm call…',
    summary: "Asks to move Thursday's 2pm call to Friday morning.",
    receivedAt: '2026-10-27T08:15:00Z',
    priority: 'medium',
    body: 'Hi,\n\nSomething came up on Thursday. Could we move our 2pm call to Friday morning instead? Any time before noon works.\n\nSam',
    draftReply:
      "Hi Sam,\n\nNo problem. Friday at 10am works for me, and I'll send an updated invite.\n\nBest,",
    filledForm: null,
    approvedAt: null,
  },
  {
    id: 'm7',
    from: 'accounts@greenleaf.example',
    subject: 'Updated price list for 2027',
    preview: 'Attached is our price list for 2027. Prices go up 4% on January 1…',
    summary: 'Supplier prices go up 4% on Jan 1. Asks you to confirm you got the new list.',
    receivedAt: '2026-10-26T13:05:00Z',
    priority: 'medium',
    body: 'Hello,\n\nAttached is our price list for 2027. Prices go up 4% on January 1. Please reply to confirm you received it.\n\nGreenleaf Accounts',
    draftReply:
      "Thanks for the heads-up. We've received the 2027 price list and will review it before our next order.",
    filledForm: null,
    approvedAt: null,
  },
  {
    id: 'm8',
    from: 'statements@firstbank.example',
    subject: 'Your October statement is ready',
    preview: 'Your statement for the account ending 4410 is ready to view…',
    summary: 'Monthly bank statement. No reply needed.',
    receivedAt: '2026-10-25T07:00:00Z',
    priority: 'low',
    body: 'Your statement for the account ending 4410 is ready to view in online banking.',
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
