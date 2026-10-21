// Prueba end-to-end del CRUD de rutinas con JWT
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
    body: JSON.stringify({ name: 'Press militar', category: 'gym', muscleGroups: 'hombros', difficulty: 'intermediate', description: null }),
  })
  const exercise = await exRes.json()
  console.log('2) Ejercicio creado:', exercise.id ?? '')

  // 3) Crear rutina con 2 ejercicios
  const rRes = await fetch(`${API}/api/routines`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      name: 'Empuje',
      description: 'Pecho, hombro y tríceps',
      exercises: [
        { exerciseId: exercise.id, position: 0, setsReps: '4x8 @ 60kg', notes: null },
        { exerciseId: exercise.id, position: 1, setsReps: '3x12 @ 40kg', notes: null },
      ],
    }),
  })
  const routine = await rRes.json()
  console.log('3) POST /api/routines:', rRes.status, '(esperado: 201)')

  // 4) Listar rutinas
  const listRes = await fetch(`${API}/api/routines`, { headers: { Authorization: `Bearer ${token}` } })
  const list = await listRes.json()
  console.log('4) GET /api/routines:', listRes.status, '-', list.length, 'rutina(s)')

  // 5) Eliminar rutina
  const dRes = await fetch(`${API}/api/routines/${routine.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
  console.log('5) DELETE:', dRes.status, '(esperado: 204)')
}

main().catch(console.error)
