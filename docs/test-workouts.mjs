// Prueba end-to-end del registro de entrenamientos con JWT
const API = 'http://localhost:8080'

async function main() {
  // 1) Login
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
  console.log('1) Login OK')

  const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  // 2) Crear un ejercicio de biblioteca para la prueba
  const exRes = await fetch(`${API}/api/exercises`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      name: 'Sentadilla',
      category: 'gym',
      muscleGroups: 'cuadriceps, gluteos',
      difficulty: 'intermediate',
      description: null,
    }),
  })
  const exercise = await exRes.json()
  console.log('2) Ejercicio creado:', exercise.id ?? '')

  // 3) Crear sesión con 2 ejercicios
  const sessionRes = await fetch(`${API}/api/workouts`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      sessionDate: '2026-10-15',
      name: 'Día de pierna',
      notes: 'Buena sesión',
      exercises: [
        { exerciseId: exercise.id, position: 0, setsReps: '4x8 @ 100kg', notes: null },
        { exerciseId: exercise.id, position: 1, setsReps: '3x12 @ 60kg', notes: null },
      ],
    }),
  })
  console.log('3) POST /api/workouts:', sessionRes.status, '(esperado: 201)')

  // 4) Listar sesiones
  const list = await fetch(`${API}/api/workouts`, { headers: { Authorization: `Bearer ${token}` } })
  const items = await list.json()
  console.log('4) GET /api/workouts:', list.status, '-', items.length, 'sesión(es)')

  // 5) Eliminar la sesión
  if (Array.isArray(items) && items.length > 0) {
    const del = await fetch(`${API}/api/workouts/${items[0].id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    console.log('5) DELETE:', del.status, '(esperado: 204)')
  }
}

main().catch((e) => console.error(e))
