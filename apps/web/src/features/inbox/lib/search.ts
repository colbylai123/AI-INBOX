import type { MessageSummary } from '../types'

// Lowercase, without accents, so "cafe" finds "Café".
const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

/** Messages whose sender, subject, summary or preview contain every word of the query. */
export function searchMessages(messages: MessageSummary[], query: string | undefined) {
  const words = fold(query ?? '')
    .split(/\s+/)
    .filter(Boolean)
  if (words.length === 0) return messages
  return messages.filter((m) => {
    const text = fold([m.from, m.subject, m.summary ?? '', m.preview].join(' '))
    return words.every((word) => text.includes(word))
  })
}
