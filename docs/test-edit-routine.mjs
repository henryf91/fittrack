// Prueba end-to-end: editar una rutina existente (PUT /api/routines/{id})
const API = 'http://localhost:8081'

async function main() {
  // 1) Login
  const loginRes = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@fittrack.dev', password: 'password123' }),
  })
  if (!loginRes.ok) throw new Error('login falló')
  const { token } = await loginRes.json()
  const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  console.log('1) Login OK')

  // 2) Crear 2 ejercicios
  const ex1 = await (
    await fetch(`${API}/api/exercises`, {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ name: 'Press militar (test edit)', category: 'gym', muscleGroups: 'hombro' }),
    })
  ).json()
  const ex2 = await (
    await fetch(`${API}/api/exercises`, {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ name: 'Jalón al pecho (test edit)', category: 'gym', muscleGroups: 'espalda' }),
    })
  ).json()
  console.log('2) Ejercicios creados:', ex1.id, ex2.id)

  // 3) Crear rutina con 1 ejercicio
  const createRes = await fetch(`${API}/api/routines`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      name: 'Rutina original (test)',
      description: null,
      exercises: [{ exerciseId: ex1.id, position: 0, setsReps: '3x8 @ 40kg', notes: null }],
    }),
  })
  const routine = await createRes.json()
  console.log('3) POST /api/routines:', createRes.status, '(esperado: 201)')

  // 4) Editar: cambiar nombre y reemplazar ejercicios (2 nuevos)
  const updateRes = await fetch(`${API}/api/routines/${routine.id}`, {
    method: 'PUT',
    headers: auth,
    body: JSON.stringify({
      name: 'Rutina editada (test)',
      description: 'Editada por test',
      exercises: [
        { exerciseId: ex1.id, position: 0, setsReps: '4x6 @ 50kg', notes: null },
        { exerciseId: ex2.id, position: 1, setsReps: '3x10', notes: null },
      ],
    }),
  })
  const updated = await updateRes.json()
  console.log('4) PUT /api/routines:', updateRes.status, '(esperado: 200)')
  console.log('   - nombre:', updated.name, '(esperado: Rutina editada (test))')
  console.log('   - ejercicios:', updated.exercises?.length, '(esperado: 2)')

  // 5) GET refleja los cambios
  const listRes = await fetch(`${API}/api/routines`, { headers: auth })
  const list = await listRes.json()
  const found = list.find((r) => r.id === routine.id)
  console.log('5) GET /api/routines:', listRes.status, '- rutina editada visible:', !!found)
  console.log('   - ejercicios tras edición:', found?.exercises.length)

  // 6) Limpieza
  const delRoutine = await fetch(`${API}/api/routines/${routine.id}`, { method: 'DELETE', headers: auth })
  const delEx1 = await fetch(`${API}/api/exercises/${ex1.id}`, { method: 'DELETE', headers: auth })
  const delEx2 = await fetch(`${API}/api/exercises/${ex2.id}`, { method: 'DELETE', headers: auth })
  console.log('5) Limpieza:', delRoutine.status, delEx1.status, delEx2.status)
}

main().catch((err) => {
  console.error('ERROR:', err)
  process.exit(1)
})
