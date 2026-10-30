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
  /** One line from the AI on why it ranked the message this way. Null until ranked. */
  priorityReason: string | null
  /** True when the AI has drafted a reply (draftReply isn't null). */
  hasDraft: boolean
  /** Set once the user approves the draft. Nothing is sent before this. */
  approvedAt: string | null
  /** The connected account the email came to, which the reply is sent from. */
  account?: MessageAccount
}

export interface MessageAccount {
  /** The id of the account's connection (see features/connections). */
  id: string
  email: string
}

export interface FormField {
  id: string
  label: string
  /** Empty when the AI couldn't fill it in. */
  value: string
  /**
   * The exact words the value came from: in the email, or in the document named
   * by sourceMaterial. Email words are copied exactly so the app can highlight
   * them. Null when the AI worked the value out, and after the user changes it.
   */
  source: string | null
  /** The uploaded document the value came from. Null (or missing) for the email. */
  sourceMaterial?: MaterialRef | null
}

/** An uploaded material, by the name it had when the form was filled. */
export interface MaterialRef {
  id: string
  name: string
}

/** A form from Materials that the AI picked and pre-filled for this reply. */
export interface FilledForm {
  materialId: string
  name: string
  fields: FormField[]
}

export interface Message extends MessageSummary {
  body: string
  draftReply: string | null
  /** Null when none of the user's materials fits this email. */
  filledForm: FilledForm | null
}

/** The user's edits to a draft, saved before approval. Saving never sends anything. */
export interface DraftUpdate {
  draftReply: string
  /** New values for the filled form's fields, keyed by field id. */
  formValues?: Record<string, string>
}

export interface MessageFilters {
  priority?: Priority
}

/** The user's own activity over the last 7 days. */
export interface WeeklyStats {
  draftsApproved: number
  /** Approved drafts that came with a filled form. */
  formsApproved: number
}
