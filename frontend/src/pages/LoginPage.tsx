import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLogin } from '../hooks/useAuth'
import { ApiError } from '../api/apiClient'

/**
 * Página de inicio de sesión.
 * useLogin (React Query mutation) maneja la petición y guarda el token.
 */
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const login = useLogin({
    onSuccess: () => navigate('/'),
  })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    login.mutate({ email, password })
  }

  return (
    <div className="auth-page">
      <h1>Iniciar sesión</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {login.isError && (
          <p className="error">
            {login.error instanceof ApiError ? login.error.message : 'Error al iniciar sesión'}
          </p>
        )}
        <button type="submit" disabled={login.isPending}>
          {login.isPending ? 'Ingresando...' : 'Iniciar sesión'}
        </button>
      </form>
      <p>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </div>
  )
}
