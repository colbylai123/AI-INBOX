import type { ReactNode } from 'react'

const wordChar = /[\p{L}\p{N}]/u
const digit = /\p{N}/u

/** Whether text[at] continues the word or number that ends just before `from`. */
function continues(text: string, at: number, from: number): boolean {
  const char = text[at]
  if (char === undefined) return false
  if (wordChar.test(char)) return true
  // "1,200" and "11.85": a separator between digits is still the same number.
  const beyond = text[at + (at < from ? -1 : 1)]
  return /[.,]/.test(char) && beyond !== undefined && digit.test(beyond)
}

/**
 * Where the phrase first appears as a whole, not inside a longer word or number,
 * so "200" doesn't match the end of "1200".
 */
function indexOfWhole(text: string, phrase: string): number {
  const startsWord = wordChar.test(phrase[0]!)
  const endsWord = wordChar.test(phrase.at(-1)!)
  for (let at = text.indexOf(phrase); at !== -1; at = text.indexOf(phrase, at + 1)) {
    const end = at + phrase.length
    if (startsWord && continues(text, at - 1, at)) continue
    if (endsWord && continues(text, end, end - 1)) continue
    return at
  }
  return -1
}

/**
 * Where each phrase first appears in the text as a whole, left to right, skipping
 * any that overlap an earlier match. Phrases that aren't in the text are ignored.
 */
export function findSpans(text: string, phrases: string[]): { start: number; end: number }[] {
  const spans = phrases
    .filter((phrase) => phrase.trim() !== '')
    .map((phrase) => {
      const start = indexOfWhole(text, phrase)
      return { start, end: start + phrase.length }
    })
    .filter((span) => span.start !== -1)
    .toSorted((a, b) => a.start - b.start || b.end - a.end)
  const kept: typeof spans = []
  for (const span of spans) {
    if (kept.length === 0 || span.start >= kept[kept.length - 1]!.end) kept.push(span)
  }
  return kept
}

/** The text with each phrase wrapped in <mark>, for showing where the AI read a value. */
export function highlight(text: string, phrases: string[]): ReactNode {
  const spans = findSpans(text, phrases)
  if (spans.length === 0) return text
  const parts: ReactNode[] = []
  let at = 0
  for (const { start, end } of spans) {
    parts.push(text.slice(at, start))
    parts.push(
      <mark key={start} className="rounded-sm bg-draft px-0.5 text-foreground ring-1 ring-border">
        {text.slice(start, end)}
      </mark>,
    )
    at = end
  }
  parts.push(text.slice(at))
  return parts
}
