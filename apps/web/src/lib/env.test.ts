import { envSchema } from './env'

describe('env', () => {
  it('drops trailing slashes from the API URL', () => {
    const env = envSchema.parse({ VITE_API_URL: 'https://api.example.com/' })
    expect(env.VITE_API_URL).toBe('https://api.example.com')
  })

  it('turns mocks off unless set to "true"', () => {
    expect(envSchema.parse({ VITE_API_URL: 'http://localhost:8000' }).VITE_USE_MOCKS).toBe(false)
  })

  it('rejects an API URL without http or https', () => {
    expect(() => envSchema.parse({ VITE_API_URL: 'localhost:8000' })).toThrow()
    expect(() => envSchema.parse({ VITE_API_URL: 'ftp://api.example.com' })).toThrow()
  })
})
