import { ApiError, apiFetch } from './api-client'

const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  fetchMock.mockReset().mockImplementation(async () => new Response('{}', { status: 200 }))
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => vi.unstubAllGlobals())

const sentHeaders = () => new Headers(fetchMock.mock.calls[0]?.[1]?.headers)

describe('apiFetch', () => {
  it('sends no Content-Type on a GET, so it needs no CORS preflight', async () => {
    await apiFetch('/messages')
    expect(sentHeaders().has('Content-Type')).toBe(false)
    expect(fetchMock.mock.calls[0]?.[1]?.credentials).toBe('include')
  })

  it('sends no Content-Type on a POST without a body', async () => {
    await apiFetch('/messages/m1/approve', { method: 'POST' })
    expect(sentHeaders().has('Content-Type')).toBe(false)
  })

  it('marks a JSON body as JSON', async () => {
    await apiFetch('/drafts', { method: 'POST', body: JSON.stringify({ a: 1 }) })
    expect(sentHeaders().get('Content-Type')).toBe('application/json')
  })

  it('keeps caller headers, including a Headers instance', async () => {
    await apiFetch('/x', { headers: new Headers({ 'X-Trace': '1' }) })
    expect(sentHeaders().get('X-Trace')).toBe('1')
  })

  it('leaves FormData bodies to the browser', async () => {
    await apiFetch('/uploads', { method: 'POST', body: new FormData() })
    expect(sentHeaders().has('Content-Type')).toBe(false)
  })

  it('throws ApiError with the status on failure', async () => {
    fetchMock.mockImplementation(async () => new Response('nope', { status: 403 }))
    const error = await apiFetch('/x').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 403, message: 'nope' })
  })
})
