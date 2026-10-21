import { Navigate } from 'react-router-dom'
import { getToken } from '../api/apiClient'
import type { ReactNode } from 'react'

/**
 * Guardián de rutas: si no hay token en localStorage, redirige a /login.
 * Es una protección básica del lado del cliente — la seguridad real
 * vive en el backend (el JWT se valida en cada petición).
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  if (!getToken()) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}
