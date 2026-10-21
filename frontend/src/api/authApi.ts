import { apiClient } from './apiClient'

/** Tipos que coinciden con los DTOs del backend. */
export interface AuthResponse {
  token: string
  email: string
  name: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export const authApi = {
  register: (data: RegisterInput) =>
    apiClient.post<AuthResponse>('/api/auth/register', data),

  login: (data: LoginInput) =>
    apiClient.post<AuthResponse>('/api/auth/login', data),
}
