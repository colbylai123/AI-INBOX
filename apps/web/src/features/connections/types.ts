// Placeholder shapes until FastAPI's generated types exist. See step 5 in docs/api-contract.md.
export type Provider = 'outlook'

export interface Connection {
  id: string
  /** More providers come later, so nothing should assume Outlook is the only one. */
  provider: Provider
  accountEmail: string
  /** "reconnect_needed" when Microsoft stopped accepting the stored token. */
  status: 'connected' | 'reconnect_needed'
  connectedAt: string
  /** Null until the first sync finishes. */
  lastSyncedAt: string | null
}

export const providerNames: Record<Provider, string> = { outlook: 'Outlook' }
