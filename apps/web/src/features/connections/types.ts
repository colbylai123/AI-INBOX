// Placeholder shapes until FastAPI's generated types exist. See steps 5 and 9 in docs/api-contract.md.
export const providers = ['outlook', 'gmail'] as const
export type Provider = (typeof providers)[number]

export interface Connection {
  id: string
  /** More providers can come later, so nothing should assume a fixed list. */
  provider: Provider
  accountEmail: string
  /** "reconnect_needed" when the provider stopped accepting the stored token. */
  status: 'connected' | 'reconnect_needed'
  connectedAt: string
  /** Null until the first sync finishes. */
  lastSyncedAt: string | null
}

export const providerNames: Record<Provider, string> = { outlook: 'Outlook', gmail: 'Gmail' }

/** Whose sign-in page connecting sends the user to. */
export const providerCompanies: Record<Provider, string> = {
  outlook: 'Microsoft',
  gmail: 'Google',
}
