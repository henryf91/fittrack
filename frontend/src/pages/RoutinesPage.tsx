import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { routinesApi, type CreateRoutineInput, type Routine, type RoutineExerciseInput } from '../api/routinesApi'
import { exercisesApi } from '../api/exercisesApi'
import { useLogout } from '../hooks/useAuth'
import { Link } from 'react-router-dom'

/**
 * Plantillas de rutinas: listado + creación de rutinas con varios
 * ejercicios planificados (orden y series/reps).
 */
export default function RoutinesPage() {
  const queryClient = useQueryClient()
  const logout = useLogout()
  const navigate = useNavigate()

  // Rutinas del usuario
  const routines = useQuery({
    queryKey: ['routines'],
    queryFn: routinesApi.findAll,
  })

  // Biblioteca para el selector de ejercicios
  const exercises = useQuery({
    queryKey: ['exercises'],
    queryFn: exercisesApi.findAll,
  })

  // ---------- Estado del formulario ----------

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [draftExercises, setDraftExercises] = useState<RoutineExerciseInput[]>([])
  const [selectedExerciseId, setSelectedExerciseId] = useState('')
  const [draftSetsReps, setDraftSetsReps] = useState('')
  // Modo edición: id de la rutina que se está editando (null = crear)
  const [editingId, setEditingId] = useState<number | null>(null)

  const createRoutine = useMutation({
    mutationFn: routinesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] })
      resetForm()
    },
  })

  const updateRoutine = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateRoutineInput }) => routinesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] })
      resetForm()
    },
  })

  const resetForm = () => {
    setName('')
    setDescription('')
    setDraftExercises([])
    setEditingId(null)
  }

  // Carga una rutina en el formulario para editarla
  const handleEdit = (routine: Routine) => {
    setEditingId(routine.id)
    setName(routine.name)
    setDescription(routine.description ?? '')
    setDraftExercises(
      routine.exercises.map((item) => ({
        exerciseId: item.exerciseId,
        position: item.position,
        setsReps: item.setsReps ?? '',
        notes: item.notes,
      })),
    )
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteRoutine = useMutation({
    mutationFn: (id: number) => routinesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routines'] }),
  })

  // Inicia una sesión de hoy copiando los ejercicios de la rutina
  const startSession = useMutation({
    mutationFn: (routineId: number) => routinesApi.startSession(routineId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
      queryClient.invalidateQueries({ queryKey: ['workouts', 'stats'] })
      navigate('/workouts')
    },
  })

  const handleAddExercise = () => {
    if (!selectedExerciseId) return
    setDraftExercises((current) => [
      ...current,
      {
        exerciseId: Number(selectedExerciseId),
        position: current.length,
        setsReps: draftSetsReps || '3x10',
        notes: null,
      },
    ])
    setSelectedExerciseId('')
    setDraftSetsReps('')
  }

  const handleRemoveDraftExercise = (index: number) => {
    setDraftExercises((current) =>
      current
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, position: i })),
    )
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const data = {
      name,
      description: description || null,
      exercises: draftExercises,
    }
    if (editingId === null) {
      createRoutine.mutate(data)
    } else {
      updateRoutine.mutate({ id: editingId, data })
    }
  }

  const exerciseName = (exerciseId: number) =>
    exercises.data?.find((e) => e.id === exerciseId)?.name ?? `Ejercicio #${exerciseId}`

  return (
    <div>
      <header>
        <h1>Rutinas</h1>
        <nav>
          <Link to="/">Ejercicios</Link>
          <Link to="/workouts">Entrenamientos</Link>
          <button onClick={logout}>Cerrar sesión</button>
        </nav>
      </header>

      <form onSubmit={handleSubmit} className="workout-form">
        <h2>{editingId === null ? 'Nueva rutina' : `Editando: ${name}`}</h2>
        <label>
          Nombre
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Empuje (pecho, hombro, tríceps)"
            required
          />
        </label>
        <label>
          Descripción
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Objetivo, notas de la rutina..."
          />
        </label>

        <h3>Ejercicios</h3>
        <div className="draft-exercises">
          {draftExercises.map((item, index) => (
            <div key={`${item.exerciseId}-${item.position}`} className="draft-exercise">
              <span>
                {exerciseName(item.exerciseId)} — {item.setsReps}
              </span>
              <button type="button" onClick={() => handleRemoveDraftExercise(index)}>
                Quitar
              </button>
            </div>
          ))}
        </div>

        <div className="draft-controls">
          <select value={selectedExerciseId} onChange={(e) => setSelectedExerciseId(e.target.value)}>
            <option value="">Selecciona un ejercicio...</option>
            {exercises.data?.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={draftSetsReps}
            onChange={(e) => setDraftSetsReps(e.target.value)}
            placeholder="4x8 @ 100kg"
          />
          <button type="button" onClick={handleAddExercise} disabled={!selectedExerciseId}>
            Añadir
          </button>
        </div>

        <button type="submit" disabled={routines.isPending || draftExercises.length === 0}>
          {editingId === null ? 'Crear rutina' : 'Guardar cambios'}
        </button>
        {editingId !== null && (
          <button type="button" onClick={resetForm}>
            Cancelar edición
          </button>
        )}
      </form>

      <h2>Mis rutinas</h2>
      {routines.isLoading && <p className="loading">Cargando rutinas...</p>}
      {routines.data && routines.data.length === 0 && <p className="muted">Aún no tienes rutinas guardadas.</p>}
      {routines.data && routines.data.length > 0 && (
        <ul>
          {routines.data.map((routine) => (
            <li key={routine.id}>
              <div>
                <strong>{routine.name}</strong>
                {routine.description && <p className="meta">{routine.description}</p>}
                <div className="routine-exercise-list">
                  {routine.exercises.map((item) => (
                    <div key={item.id} className="routine-exercise-item">
                      {item.position + 1}. {item.exerciseName} — {item.setsReps}
                    </div>
                  ))}
                </div>
              </div>
              <div className="routine-actions">
                <button
                  onClick={() => startSession.mutate(routine.id)}
                  disabled={startSession.isPending}
                >
                  {startSession.isPending ? 'Iniciando...' : 'Iniciar sesión'}
                </button>
                <button onClick={() => handleEdit(routine)}>Editar</button>
                <button onClick={() => deleteRoutine.mutate(routine.id)}>Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
