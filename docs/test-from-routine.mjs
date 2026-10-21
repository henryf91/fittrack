// Prueba end-to-end: iniciar sesión de entrenamiento desde una rutina
const API = 'http://localhost:8080'

async function main() {
  // 1) Login
  const loginRes = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@fittrack.dev', password: 'password123' }),
  })
  const { token } = await loginRes.json()
  const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  console.log('1) Login OK')

  // 2) Crear ejercicio para la rutina
  const exRes = await fetch(`${API}/api/exercises`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({ name: 'Press banca (test from-routine)', category: 'gym', muscleGroups: 'pecho, triceps' }),
  })
  const exercise = await exRes.json()
  console.log('2) POST /api/exercises:', exRes.status, '-', JSON.stringify(exercise))

  // 2b) Crear rutina con 2 ejercicios
  const rRes = await fetch(`${API}/api/routines`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      name: 'Día de empuje (test)',
      description: 'Rutina de prueba para from-routine',
      exercises: [
        { exerciseId: exercise.id, position: 0, setsReps: '4x8 @ 80kg', notes: null },
        { exerciseId: exercise.id, position: 1, setsReps: '3x12 @ 60kg', notes: 'Al fallo' },
      ],
    }),
  })
  const routine = await rRes.json()
  console.log('2) POST /api/routines:', rRes.status, '(esperado: 201)')

  // 3) Iniciar sesión desde la rutina
  const sRes = await fetch(`${API}/api/workouts/from-routine/${routine.id}`, {
    method: 'POST',
    headers: auth,
    body: '{}',
  })
  const session = await sRes.json()
  console.log('3) POST /api/workouts/from-routine:', sRes.status, '(esperado: 201)')
  console.log('   - nombre:', session.name)
  console.log('   - ejercicios copiados:', session.exercises?.length, '(esperado: 2)')

  // 4) Verificar que la sesión aparece en el listado
  const listRes = await fetch(`${API}/api/workouts`, { headers: { Authorization: `Bearer ${token}` } })
  const sessions = await listRes.json()
  const found = sessions.find((s) => s.id === session.id)
  console.log('4) GET /api/workouts:', listRes.status, '- sesión encontrada:', Boolean(session))

  // 5) Limpieza: borrar sesión y rutina de prueba
  const d1 = await fetch(`${API}/api/workouts/${session.id}`, { method: 'DELETE', headers: auth })
  const d2 = await fetch(`${API}/api/routines/${routine.id}`, { method: 'DELETE', headers: auth })
  const d3 = await fetch(`${API}/api/exercises/${exercise.id}`, { method: 'DELETE', headers: auth })
  console.log('5) Limpieza:', d1.status, d2.status, d3.status)
}

main().catch((err) => {
  console.error('ERROR:', err.message)
  process.exit(1)
})
