import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/app'
import { createQueryClient } from '@/app/query-client'
import { createAppRouter } from '@/app/router'
import '@/styles/globals.css'

const queryClient = createQueryClient()
const router = createAppRouter({ queryClient })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App queryClient={queryClient} router={router} />
  </StrictMode>,
)
