/**
 * Prueba end-to-end del flujo de autenticación.
 * Uso: node test-auth.mjs
 */
const API_URL = 'http://localhost:8080'

async function main() {
  console.log('=== Prueba end-to-end de FitTrack ===\n')

  // 1. Registro
  console.log('1) POST /api/auth/register')
  const registerRes = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email: 'test@fittrack.dev', password: 'password123' }),
  })
  const registerData = await registerRes.json()
  console.log(`   Status: ${registerRes.status}`)
  console.log(`   Token: ${registerData.token ? 'OK (' + registerData.token.length + ' chars)' : 'FALLO'}`)

  // 2. Login con el mismo usuario
  console.log('\n2) POST /api/auth/login')
  const loginRes = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@fittrack.dev', password: 'password123' }),
  })
  const loginData = await loginRes.json()
  console.log(`   Status: ${loginRes.status}`)
  console.log(`   Token: ${loginData.token ? 'OK (' + loginData.token.substring(0, 25) + '...)' : 'FALLO'}`)

  // 3. Login con contraseña incorrecta (debe fallar con 401)
  console.log('\n3) Login con contraseña incorrecta:')
  const badRes = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@fittrack.dev', password: 'wrongpass' }),
  })
  console.log(`   Status: ${badRes.status} (esperado: 401)`)
}

main()
