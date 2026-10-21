// Prueba end-to-end: progresión de un ejercicio entre sesiones
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

  // 2) Crear ejercicio
  const exRes = await fetch(`${API}/api/exercises`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({ name: 'Sentadilla (test progresión)', category: 'gym', muscleGroups: 'cuadriceps, gluteos' }),
  })
  const exercise = await exRes.json()
  console.log('2) POST /api/exercises:', exRes.status, '- id:', exercise.id)

  // 3) Crear 2 sesiones en fechas distintas con sets/reps distintos
  const sessions = []
  const cases = [
    { date: '2026-10-13', setsReps: '3x8 @ 100kg' },
    { date: '2026-10-15', setsReps: '4x8 @ 105kg' },
  ]
  for (const c of cases) {
    const sRes = await fetch(`${API}/api/workouts`, {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({
        sessionDate: c.date,
        name: `Test progresión ${c.date}`,
        notes: null,
        exercises: [{ exerciseId: exercise.id, position: 0, setsReps: c.setsReps, notes: null }],
      }),
    })
    const session = await sRes.json()
    sessions.push(session)
    console.log(`3) POST sesión ${c.date}:`, sRes.status, '(esperado: 201)')
  }

  // 4) Consultar progresión
  const pRes = await fetch(`${API}/api/workouts/progression/${exercise.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const progression = await pRes.json()
  console.log('4) GET /api/workouts/progression:', pRes.status, '(esperado: 200)')
  console.log('   - entradas:', progression.length, '(esperado: 2)')
  console.log('   - orden:', progression.map((e) => e.date).join(' → '))
  console.log('   - sets/reps:', progression.map((e) => e.setsReps).join(' | '))

  const datesOk =
    progression.length === 2 &&
    progression[0].date === '2026-10-13' &&
    progression[1].date === '2026-10-15'
  console.log('   - orden correcto (antiguo → reciente):', datesOk ? 'SÍ ✅' : 'NO ❌')

  // 5) Limpieza
  for (const s of sessions) {
    await fetch(`${API}/api/workouts/${s.id}`, { method: 'DELETE', headers: auth })
  }
  const dEx = await fetch(`${API}/api/exercises/${exercise.id}`, { method: 'DELETE', headers: auth })
  console.log('5) Limpieza OK - ejercicio:', dEx.status)
}

main().catch((err) => {
  console.error('ERROR:', err.message)
  process.exit(1)
})
