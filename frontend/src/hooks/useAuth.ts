import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi, type AuthResponse, type LoginInput, type RegisterInput } from '../api/authApi'
import { setToken } from '../api/apiClient'

/**
 * Hook de autenticación con React Query.
 * - useMutation maneja las peticiones de register/login (estados: pending, error, success).
 * - Al tener éxito, guarda el token en localStorage.
 */

export function useRegister(options?: { onSuccess?: (data: AuthResponse) => void }) {
  return useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: (data) => {
      setToken(data.token)
      options?.onSuccess?.(data)
    },
  })
}

export function useLogin(options?: { onSuccess?: (data: AuthResponse) => void }) {
  return useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: (data) => {
      setToken(data.token)
      options?.onSuccess?.(data)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return () => {
    localStorage.removeItem('fittrack_token')
    queryClient.clear()
  }
}
