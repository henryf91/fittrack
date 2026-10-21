// Prueba end-to-end del endpoint de estadísticas con JWT
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

  // 2) Crear ejercicio
  const exRes = await fetch(`${API}/api/exercises`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      name: 'Press banca',
      category: 'gym',
      muscleGroups: 'pecho, triceps',
      difficulty: 'intermediate',
      description: null,
    }),
  })
  const exercise = await exRes.json()
  console.log('2) Ejercicio creado:', exercise.id ?? '')

  // 3) Crear sesión HOY (para que la racha cuente)
  const today = new Date().toISOString().slice(0, 10)
  const s1 = await fetch(`${API}/api/workouts`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      sessionDate: today,
      name: 'Sesión hoy',
      exercises: [{ exerciseId: exercise.id, position: 0, setsReps: '3x10', notes: null }],
    }),
  })
  console.log('3) POST sesión hoy:', s1.status, '(esperado: 201)')

  // 4) Crear sesión ayer
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const s2 = await fetch(`${API}/api/workouts`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      sessionDate: yesterday,
      name: 'Sesión ayer',
      exercises: [{ exerciseId: exercise.id, position: 0, setsReps: '3x8', notes: null }],
    }),
  })
  console.log('4) POST sesión ayer:', s2.status, '(esperado: 201)')

  // 5) Consultar stats
  const statsRes = await fetch(`${API}/api/workouts/stats`, { headers: { Authorization: `Bearer ${token}` } })
  const stats = await statsRes.json()
  console.log('5) GET /api/workouts/stats:', statsRes.status, JSON.stringify(stats))

  // 6) Limpiar las sesiones creadas
  for (const id of [(await s1.json()).id, (await s2.json()).id]) {
    await fetch(`${API}/api/workouts/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
  }
  console.log('6) Sesiones de prueba eliminadas')
}

main().catch(console.error)
