const PROBE_ORIGIN = 'https://app.invalid'

/**
 * True when `value` is a path on this app (e.g. "/inbox?priority=high").
 * Rejects absolute URLs, protocol-relative "//host" and backslash tricks
 * ("/\host"), which browsers would resolve to another site.
 *
 * Client-side guard only: FastAPI must validate `return_to` itself too.
 */
export function isSafeRedirectPath(value: string): boolean {
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return false
  try {
    // The URL parser also strips tabs/newlines, so "/\t/host" is caught here.
    return new URL(value, PROBE_ORIGIN).origin === PROBE_ORIGIN
  } catch {
    return false
  }
}
