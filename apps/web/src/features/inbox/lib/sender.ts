// Mail providers and placeholder domains, where the domain doesn't name the sender.
const sharedDomains = new Set([
  'example',
  'gmail',
  'googlemail',
  'outlook',
  'hotmail',
  'live',
  'msn',
  'yahoo',
  'icloud',
  'me',
  'aol',
  'proton',
  'protonmail',
])

const words = (text: string) =>
  text
    .split(/[._+-]+/)
    .filter(Boolean)
    .map((word) => word[0]!.toUpperCase() + word.slice(1))
    .join(' ')

/** The sender's address, from "Name <address>" or a bare address. */
export function senderAddress(from: string) {
  return /<([^>]+)>/.exec(from)?.[1]?.trim() ?? from.trim()
}

/**
 * A name to show for the sender. The display name when the API sends one; otherwise
 * the company from the address's domain, or the part before the @ for a shared domain
 * such as gmail.com: "orders@brightline.example" is Brightline, "sam@gmail.com" is Sam.
 */
export function senderName(from: string) {
  const named = /^\s*"?([^"<]+?)"?\s*</.exec(from)?.[1]
  if (named) return named
  const [local = '', domain = ''] = senderAddress(from).split('@')
  const label = domain.split('.')[0] ?? ''
  return words(!label || sharedDomains.has(label.toLowerCase()) ? local : label) || from
}

/** A steady hue for the sender's round mark, so each sender keeps one color. */
export function senderHue(from: string) {
  let hash = 0
  for (const char of senderAddress(from).toLowerCase()) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return Math.abs(hash) % 360
}
