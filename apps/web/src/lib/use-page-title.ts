import { useEffect } from 'react'

// The product name in the browser tab. Also in index.html, for the first paint.
const siteName = 'AI Inbox'

/**
 * Names the page in the browser tab and its history, and for screen readers, which
 * read the title when a page opens. Without a title, the tab shows the product name.
 */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${siteName}` : siteName
  }, [title])
}
