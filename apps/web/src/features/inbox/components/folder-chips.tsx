import { Link } from '@tanstack/react-router'
import {
  Archive,
  Ban,
  FileText,
  Inbox,
  type LucideIcon,
  OctagonAlert,
  Send,
  Star,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Folder, folderNames } from '../lib/folders'

const chips: { folder: Folder | undefined; icon: LucideIcon }[] = [
  { folder: undefined, icon: Inbox },
  { folder: 'sent', icon: Send },
  { folder: 'drafts', icon: FileText },
  { folder: 'favorites', icon: Star },
  { folder: 'archive', icon: Archive },
  { folder: 'deleted', icon: Trash2 },
  { folder: 'spam', icon: OctagonAlert },
  { folder: 'junk', icon: Ban },
]

/** The folder chips. The folder lives in the URL (?folder=sent), beside the filters and search. */
export function FolderChips({
  folder,
  inboxCount,
  className,
}: {
  folder: Folder | undefined
  /** How many emails are in the inbox, shown on its chip. */
  inboxCount: number
  className?: string
}) {
  return (
    <nav
      aria-label="Folders"
      // The padding keeps focus outlines from being clipped by the scroll area.
      className={cn(
        '-m-1 flex min-w-0 [scrollbar-width:none] gap-2 overflow-x-auto p-1',
        className,
      )}
    >
      {chips.map(({ folder: id, icon: Icon }) => {
        const name = folderNames[id ?? 'inbox']
        const selected = id === folder
        return (
          <Link
            key={name}
            to="/inbox"
            // Keeps the filters and search; only the folder changes.
            search={(prev) => ({ ...prev, folder: id })}
            // The router marks the open folder with aria-current="page", also while an
            // email is open. Without explicitUndefined, Inbox would count as open
            // under ?folder=sent.
            activeOptions={{ explicitUndefined: true }}
            aria-label={id === undefined ? `${name}, ${inboxCount} emails` : undefined}
            className={cn(
              'inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-metadata font-medium whitespace-nowrap transition-[color,background-color,border-color,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:active:opacity-80',
              selected
                ? 'border-transparent bg-foreground text-background'
                : 'border-card-edge bg-card text-muted-foreground hover:bg-muted hover:text-foreground dark:bg-raised dark:hover:bg-muted',
            )}
          >
            <Icon className="size-4" aria-hidden />
            {name}
            {id === undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 text-label font-semibold tabular-nums',
                  selected ? 'bg-background/20' : 'bg-muted',
                )}
              >
                {inboxCount}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
