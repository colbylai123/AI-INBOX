import { env } from './env'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const isApiError = (error: unknown, status?: number): error is ApiError =>
  error instanceof ApiError && (status === undefined || error.status === status)

/**
 * The single place the app talks to FastAPI. When the backend publishes its
 * OpenAPI spec, run `npm run gen:api` and move call sites to a client typed by
 * the generated schema (e.g. openapi-fetch) behind this same module.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  // Only JSON bodies get a JSON content type. GETs stay "simple" requests (no CORS
  // preflight), and FormData/Blob bodies keep the type the browser sets for them.
  if (typeof init?.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const res = await fetch(`${env.VITE_API_URL}${path}`, {
    ...init,
    headers,
    // Session cookie set by FastAPI after WorkOS sign-in.
    credentials: 'include',
  })
  if (!res.ok) {
    throw new ApiError(res.status, (await res.text()) || res.statusText)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
