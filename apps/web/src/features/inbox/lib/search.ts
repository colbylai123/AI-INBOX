import type { MessageSummary } from '../types'

// Letters that don't break down into a base letter and an accent.
const plain: Record<string, string> = {
  ø: 'o',
  æ: 'ae',
  œ: 'oe',
  ß: 'ss',
  đ: 'd',
  ð: 'd',
  ł: 'l',
  þ: 'th',
  ı: 'i',
}

// Lowercase, without accents, so "cafe" finds "Café" and "soren" finds "Søren".
const fold = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[øæœßđðłþı]/g, (letter) => plain[letter]!)

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
