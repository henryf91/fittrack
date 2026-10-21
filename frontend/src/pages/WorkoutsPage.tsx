import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { workoutsApi, type CreateSessionInput, type SessionExerciseInput } from '../api/workoutsApi'
import { exercisesApi } from '../api/exercisesApi'
import WeeklyVolumeChart from '../components/WeeklyVolumeChart'
import ProgressionChart from '../components/ProgressionChart'
import { Link } from 'react-router-dom'

/**
 * Registro de entrenamientos: estadísticas + lista de sesiones +
 * formulario para registrar una nueva sesión con varios ejercicios.
 */
export default function WorkoutsPage() {
  const queryClient = useQueryClient()

  // Sesiones del usuario (el backend filtra por el JWT automáticamente)
  const sessions = useQuery({
    queryKey: ['workouts'],
    queryFn: workoutsApi.findAll,
  })

  // Estadísticas del usuario
  const stats = useQuery({
    queryKey: ['workouts', 'stats'],
    queryFn: workoutsApi.stats,
  })

  // Volumen diario (últimas 8 semanas) para la gráfica
  const volume = useQuery({
    queryKey: ['workouts', 'volume'],
    queryFn: workoutsApi.volume,
  })

  // Biblioteca para el selector de ejercicios
  const exercises = useQuery({
    queryKey: ['exercises'],
    queryFn: exercisesApi.findAll,
  })

  // Progresión del ejercicio seleccionado (null = no mostrar la sección)
  const [progressionExerciseId, setProgressionExerciseId] = useState('')
  const progression = useQuery({
    queryKey: ['workouts', 'progression', progressionExerciseId],
    queryFn: () => workoutsApi.progression(Number(progressionExerciseId)),
    enabled: progressionExerciseId !== '',
  })

  // Estado del formulario: datos de la sesión + borrador de ejercicios
  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [draftExercises, setDraftExercises] = useState<SessionExerciseInput[]>([])
  const [selectedExerciseId, setSelectedExerciseId] = useState('')
  const [setsReps, setSetsReps] = useState('')

  const createSession = useMutation({
    mutationFn: (data: CreateSessionInput) => workoutsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
      setName('')
      setNotes('')
      setDraftExercises([])
    },
  })

  const deleteSession = useMutation({
    mutationFn: (id: number) => workoutsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workouts'] }),
  })

  const handleAddExercise = () => {
    if (!selectedExerciseId) return
    setDraftExercises((current) => [
      ...current,
      {
        exerciseId: Number(selectedExerciseId),
        position: draftExercises.length,
        setsReps,
        notes: null,
      },
    ])
    setSetsReps('')
  }

  const removeDraftExercise = (index: number) => {
    setDraftExercises((current) =>
      current
        .filter((_, i) => i !== index)
        .map((ex, i) => ({ ...ex, position: i })),
    )
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (draftExercises.length === 0) return
    createSession.mutate({
      sessionDate,
      name,
      notes: notes || null,
      exercises: draftExercises,
    })
  }

  const exerciseName = (exerciseId: number) =>
    exercises.data?.find((e) => e.id === exerciseId)?.name ?? `Ejercicio #${exerciseId}`

  return (
    <div className="workouts-page">
      <header>
        <h1>📝 Registro de entrenamientos</h1>
        <nav>
          <Link to="/">Biblioteca</Link>
          <Link to="/routines">Rutinas</Link>
          <button onClick={() => { localStorage.removeItem('fittrack_token'); location.href = '/login' }}>
            Cerrar sesión
          </button>
        </nav>
      </header>

      {stats.data && (
        <section className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{stats.data.totalSessions}</span>
            <span className="stat-label">Sesiones totales</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.data.sessionsLast30Days}</span>
            <span className="stat-label">Últimos 30 días</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">🔥 {stats.data.currentStreakDays}</span>
            <span className="stat-label">Racha (días)</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.data.exercisesThisWeek}</span>
            <span className="stat-label">Ejercicios esta semana</span>
          </div>
        </section>
      )}

      {volume.data && volume.data.length > 0 && (
        <section className="chart-section">
          <h2>Volumen diario (últimas 8 semanas)</h2>
          <WeeklyVolumeChart data={volume.data} />
        </section>
      )}

      <section className="progression-section">
        <h2>Progresión por ejercicio</h2>
        <label>
          Ejercicio
          <select
            value={progressionExerciseId}
            onChange={(e) => setProgressionExerciseId(e.target.value)}
          >
            <option value="">— Selecciona un ejercicio —</option>
            {exercises.data?.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
        </label>

        {progressionExerciseId !== '' && progression.isPending && <p className="loading">Cargando...</p>}
        {progression.isError && <p className="error">Error al cargar la progresión</p>}

        {progression.data && progression.data.length === 0 && (
          <p className="muted">Aún no has registrado este ejercicio en ninguna sesión.</p>
        )}

        {progression.data && progression.data.length > 0 && (
          <ProgressionChart data={progression.data} />
        )}

        {progression.data && progression.data.length > 0 && (
          <ul className="progression-list">
            {progression.data.map((entry, index) => (
              <li key={index}>
                <span className="progression-date">{entry.date}</span>
                <span className="progression-setsreps">{entry.setsReps ?? '—'}</span>
                {entry.notes && (
                  <span className="progression-notes">{entry.notes}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <form onSubmit={handleSubmit} className="workout-form">
        <h2>Nueva sesión</h2>
        <label>
          Fecha
          <input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} required />
        </label>
        <label>
          Nombre
          <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} placeholder="Día de pecho" />
        </label>
        <label>
          Notas (opcional)
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>

        <fieldset>
          <legend>Ejercicios de la sesión</legend>
          <label>
            Ejercicio
            <select value={selectedExerciseId} onChange={(e) => setSelectedExerciseId(e.target.value)}>
              <option value="">Selecciona un ejercicio...</option>
              {exercises.data?.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </label>
          <label>
            Series/reps o detalle
            <input value={setsReps} onChange={(e) => setSetsReps(e.target.value)} placeholder="3x10 @ 60kg" />
          </label>
          <button type="button" onClick={handleAddExercise} disabled={!selectedExerciseId}>
            Agregar
          </button>

          {draftExercises.length > 0 && (
            <ul className="draft-list">
              {draftExercises.map((ex, index) => (
                <li key={index}>
                  {exerciseName(ex.exerciseId)} — {ex.setsReps || 'sin detalles'}
                  <button type="button" onClick={() => removeDraftExercise(index)}>✕</button>
                </li>
              ))}
            </ul>
          )}
        </fieldset>

        {createSession.isError && <p className="error">Error al crear la sesión</p>}
        <button type="submit" disabled={createSession.isPending || draftExercises.length === 0}>
          {createSession.isPending ? 'Guardando...' : 'Guardar sesión'}
        </button>
      </form>

      {sessions.isPending && <p>Cargando...</p>}
      {sessions.isError && <p className="error">Error al cargar las sesiones</p>}
      {sessions.data && (
        <ul className="session-list">
          {sessions.data.map((session) => (
            <li key={session.id}>
              <strong>{session.name}</strong>
              <span className="meta">{session.sessionDate}</span>
              <ul>
                {session.exercises.map((ex) => (
                  <li key={ex.id}>
                    {ex.exerciseName} — {ex.setsReps || ''}
                  </li>
                ))}
              </ul>
              <button onClick={() => deleteSession.mutate(session.id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
