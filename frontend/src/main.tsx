import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'

// QueryClient: el "cerebro" de React Query.
// Gestiona la caché de datos del servidor, reintentos y estados.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,      // datos frescos por 30s antes de re-fetch
      retry: 1,               // reintenta 1 vez si la API falla
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
