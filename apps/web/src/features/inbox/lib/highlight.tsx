import type { ReactNode } from 'react'

/**
 * Where each phrase first appears in the text, left to right, skipping any that
 * overlap an earlier match. Phrases that aren't in the text are ignored.
 */
export function findSpans(text: string, phrases: string[]): { start: number; end: number }[] {
  const spans = phrases
    .filter((phrase) => phrase.trim() !== '')
    .map((phrase) => ({ start: text.indexOf(phrase), end: text.indexOf(phrase) + phrase.length }))
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
      <mark
        key={start}
        className="rounded-sm bg-primary/12 px-0.5 text-foreground ring-1 ring-primary/30"
      >
        {text.slice(start, end)}
      </mark>,
    )
    at = end
  }
  parts.push(text.slice(at))
  return parts
}
