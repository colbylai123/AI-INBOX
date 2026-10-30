// Public surface of the inbox feature. Import from '@/features/inbox', not deep paths.
export { resetSampleInbox } from './api/inbox-api'
export { inboxKeys, messageQuery, messagesQuery, weeklyStatsQuery } from './api/queries'
export { ChatBubble } from './components/chat-bubble'
export { DraftReview } from './components/draft-review'
export { FilledFormView } from './components/filled-form'
export { MessageList } from './components/message-list'
export { PriorityBadge } from './components/priority-badge'
export { PriorityFilter } from './components/priority-filter'
export { SearchBox } from './components/search-box'
export { WeeklySummary } from './components/weekly-summary'
export { useApproveDraft } from './hooks/use-approve-draft'
export { useSaveDraft } from './hooks/use-save-draft'
export { searchMessages } from './lib/search'
export { sortByPriority } from './lib/sort'
export { priorities } from './types'
export type {
  DraftUpdate,
  FilledForm,
  FormField,
  MessageAccount,
  Message,
  MessageFilters,
  MessageSummary,
  Priority,
  WeeklyStats,
} from './types'
