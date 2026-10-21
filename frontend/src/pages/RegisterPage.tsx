import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRegister } from '../hooks/useAuth'
import { ApiError } from '../api/apiClient'

/**
 * Página de registro de cuenta.
 * useRegister (React Query mutation) maneja la petición y guarda el token.
 */
export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const register = useRegister({
    onSuccess: () => navigate('/'),
  })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    register.mutate({ name, email, password })
  }

  return (
    <div className="auth-page">
      <h1>Crear cuenta</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Nombre
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
          />
        </label>
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
            minLength={8}
          />
        </label>
        {register.isError && (
          <p className="error">
            {register.error instanceof ApiError ? register.error.message : 'Error al registrarse'}
          </p>
        )}
        <button type="submit" disabled={register.isPending}>
          {register.isPending ? 'Creando...' : 'Crear cuenta'}
        </button>
      </form>
      <p>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  )
}
