// Public surface of the inbox feature. Import from '@/features/inbox', not deep paths.
export { resetSampleInbox } from './api/inbox-api'
export { inboxKeys, messageQuery, messagesQuery, weeklyStatsQuery } from './api/queries'
export { ChatBubble } from './components/chat-bubble'
export { FilledFormView } from './components/filled-form'
export { FolderChips } from './components/folder-chips'
export { MessageList } from './components/message-list'
export { NewEmailButton } from './components/new-email-button'
export { PriorityBadge } from './components/priority-badge'
export { PriorityFilter } from './components/priority-filter'
export { ReadingPane } from './components/reading-pane'
export { SearchBox } from './components/search-box'
export { SendQueue } from './components/send-queue'
export { WeeklySummary } from './components/weekly-summary'
export { useInboxList } from './hooks/use-inbox-list'
export { useSaveDraft } from './hooks/use-save-draft'
export { folderNames, folders } from './lib/folders'
export type { Folder } from './lib/folders'
export { resetLocalFolders } from './lib/local-folders'
export { searchMessages } from './lib/search'
export { sortByPriority } from './lib/sort'
export { priorities } from './types'
export type {
  DraftUpdate,
  FilledForm,
  FormField,
  MaterialRef,
  MessageAccount,
  Message,
  MessageFilters,
  MessageSummary,
  Priority,
  WeeklyStats,
} from './types'
