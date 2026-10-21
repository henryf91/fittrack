// Prueba end-to-end del CRUD de ejercicios con JWT
const API = 'http://localhost:8080'

async function main() {
  // 1) Login para obtener JWT
  const loginRes = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@fittrack.dev', password: 'password123' }),
  })
  if (!loginRes.ok) {
    console.log('1) Login falló:', loginRes.status)
    return
  }
  const { token } = await loginRes.json()
  console.log('1) Login OK, JWT obtenido')

  const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  // 2) Sin token -> debe dar 401
  const noAuth = await fetch(`${API}/api/exercises`)
  console.log('2) GET /api/exercises sin token:', noAuth.status, '(esperado: 401)')

  // 3) Con token: crear ejercicio
  const createRes = await fetch(`${API}/api/exercises`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      name: 'Press de banca',
      category: 'gym',
      muscleGroups: 'pecho, triceps',
      difficulty: 'intermediate',
      description: 'Press de banca con barra',
    }),
  })
  console.log('3) POST /api/exercises:', createRes.status, '(esperado: 201)')

  // 4) Listar
  const list = await fetch(`${API}/api/exercises`, { headers: { Authorization: `Bearer ${token}` } })
  const items = await list.json()
  console.log('4) GET /api/exercises:', list.status, '-', items.length, 'ejercicio(s)')

  // 5) Eliminar el creado
  if (Array.isArray(items) && items.length > 0) {
    const del = await fetch(`${API}/api/exercises/${items[items.length - 1].id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    console.log('5) DELETE:', del.status, '(esperado: 204)')
  }
}

main().catch((e) => console.error(e))
