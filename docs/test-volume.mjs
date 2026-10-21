// Prueba end-to-end del endpoint de volumen con JWT
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
    body: JSON.stringify({ name: 'Peso muerto', category: 'gym', muscleGroups: 'espalda', difficulty: 'intermediate', description: null }),
  })
  const exercise = await exRes.json()
  console.log('2) Ejercicio creado:', exercise.id ?? '')

  // 3) Crear sesión hoy con 3 ejercicios
  const today = new Date().toISOString().slice(0, 10)
  const s1 = await fetch(`${API}/api/workouts`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      sessionDate: today,
      name: 'Volumen test',
      exercises: [
        { exerciseId: exercise.id, position: 0, setsReps: '3x10', notes: null },
        { exerciseId: exercise.id, position: 1, setsReps: '3x8', notes: null },
        { exerciseId: exercise.id, position: 2, setsReps: '3x8', notes: null },
      ],
    }),
  })
  const session1 = await s1.json()
  console.log('3) POST sesión hoy:', s1.status, '(esperado: 201)')

  // 4) Consultar volumen
  const volRes = await fetch(`${API}/api/workouts/volume`, { headers: { Authorization: `Bearer ${token}` } })
  const volume = await volRes.json()
  console.log('4) GET /api/workouts/volume:', volRes.status, JSON.stringify(volume))

  // 5) Limpiar
  await fetch(`${API}/api/workouts/${session1.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
  console.log('5) Limpieza OK')
}

main().catch(console.error)
