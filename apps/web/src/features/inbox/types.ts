// Placeholder shapes. Replace with types generated from FastAPI's OpenAPI spec
// (`npm run gen:api`); keep the names so call sites don't change.
export const priorities = ['high', 'medium', 'low'] as const
export type Priority = (typeof priorities)[number]

export interface MessageSummary {
  id: string
  from: string
  subject: string
  preview: string
  /** One line from the AI on what the sender wants. Null until it has read the message. */
  summary: string | null
  receivedAt: string
  priority: Priority
}

export interface Message extends MessageSummary {
  body: string
  draftReply: string | null
  /** Set once the user approves the draft. Nothing is sent before this. */
  approvedAt: string | null
}

export interface MessageFilters {
  priority?: Priority
}
