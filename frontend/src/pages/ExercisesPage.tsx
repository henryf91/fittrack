import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { exercisesApi, type ExerciseInput } from '../api/exercisesApi'
import { useLogout } from '../hooks/useAuth'
import { Link } from 'react-router-dom'

const CATEGORIES = ['gym', 'cardio', 'calisthenics', 'outdoor'] as const
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const

const CATEGORY_LABELS: Record<(typeof CATEGORIES)[number], string> = {
  gym: 'Gym',
  cardio: 'Cardio',
  calisthenics: 'Calistenia',
  outdoor: 'Exterior',
}

const DIFFICULTY_LABELS: Record<(typeof DIFFICULTIES)[number], string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
}

/**
 * Biblioteca de ejercicios: listado con React Query + formulario de creación.
 * La petición incluye el JWT automáticamente (lo inyecta apiClient).
 */
export default function ExercisesPage() {
  const queryClient = useQueryClient()
  const logout = useLogout()

  // React Query: caché + estados (pending, error, success) + refetch automático
  const exercises = useQuery({
    queryKey: ['exercises'],
    queryFn: exercisesApi.findAll,
  })

  const [name, setName] = useState('')
  const [category, setCategory] = useState<ExerciseInput['category']>('gym')
  const [muscleGroups, setMuscleGroups] = useState('')
  const [difficulty, setDifficulty] = useState<ExerciseInput['difficulty']>('beginner')
  const [description, setDescription] = useState('')

  const createExercise = useMutation({
    mutationFn: (data: ExerciseInput) => exercisesApi.create(data),
    onSuccess: () => {
      // Invalida la caché -> React Query re-obtiene el listado solo
      queryClient.invalidateQueries({ queryKey: ['exercises'] })
      setName('')
      setMuscleGroups('')
      setDescription('')
    },
  })

  const deleteExercise = useMutation({
    mutationFn: (id: number) => exercisesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exercises'] }),
  })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    createExercise.mutate({ name, category, muscleGroups, difficulty, description: description || null })
  }

  return (
    <div className="exercises-page">
      <header>
        <h1>🏋️ Biblioteca de ejercicios</h1>
        <nav>
          <Link to="/workouts">Entrenamientos</Link>
          <Link to="/routines">Rutinas</Link>
          <button onClick={logout}>Cerrar sesión</button>
        </nav>
      </header>

      <form onSubmit={handleSubmit} className="exercise-form">
        <h2>Nuevo ejercicio</h2>
        <label>
          Nombre
          <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} />
        </label>
        <label>
          Categoría
          <select value={category} onChange={(e) => setCategory(e.target.value as ExerciseInput['category'])}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </label>
        <label>
          Grupos musculares (separados por comas)
          <input
            value={muscleGroups}
            onChange={(e) => setMuscleGroups(e.target.value)}
            required
            placeholder="pecho, triceps"
          />
        </label>
        <label>
          Dificultad
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as ExerciseInput['difficulty'])}>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>
            ))}
          </select>
        </label>
        <label>
          Descripción (opcional)
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        {createExercise.isError && (
          <p className="error">Error al crear el ejercicio</p>
        )}
        <button type="submit" disabled={createExercise.isPending}>
          {createExercise.isPending ? 'Guardando...' : 'Agregar ejercicio'}
        </button>
      </form>

      {exercises.isPending && <p>Cargando...</p>}
      {exercises.isError && <p className="error">Error al cargar los ejercicios</p>}
      {exercises.data && (
        <ul className="exercise-list">
          {exercises.data.map((exercise) => (
            <li key={exercise.id}>
              <strong>{exercise.name}</strong>
              <span className="meta">
                {CATEGORY_LABELS[exercise.category]} · {DIFFICULTY_LABELS[exercise.difficulty]} · {exercise.muscleGroups}
              </span>
              <button onClick={() => deleteExercise.mutate(exercise.id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
