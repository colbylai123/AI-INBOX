// Public surface of the inbox feature. Import from '@/features/inbox', not deep paths.
export { inboxKeys, messageQuery, messagesQuery } from './api/queries'
export { ChatBubble } from './components/chat-bubble'
export { DraftReview } from './components/draft-review'
export { FilledFormView } from './components/filled-form'
export { MessageList } from './components/message-list'
export { PriorityBadge } from './components/priority-badge'
export { PriorityFilter } from './components/priority-filter'
export { useApproveDraft } from './hooks/use-approve-draft'
export { useSaveDraft } from './hooks/use-save-draft'
export { sortByPriority } from './lib/sort'
export { priorities } from './types'
export type {
  DraftUpdate,
  FilledForm,
  FormField,
  Message,
  MessageFilters,
  MessageSummary,
  Priority,
} from './types'
