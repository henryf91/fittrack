import { apiClient } from './apiClient'

/** Tipos que coinciden con los DTOs del backend. */
export interface SessionExercise {
  id: number
  exerciseId: number
  exerciseName: string
  category: string
  position: number
  setsReps: string | null
  notes: string | null
}

export interface WorkoutSession {
  id: number
  sessionDate: string
  name: string
  notes: string | null
  exercises: SessionExercise[]
}

export interface SessionExerciseInput {
  exerciseId: number
  position: number
  setsReps: string
  notes: string | null
}

export interface CreateSessionInput {
  sessionDate: string
  name: string
  notes: string | null
  exercises: SessionExerciseInput[]
}

export interface WorkoutStats {
  totalSessions: number
  sessionsLast30Days: number
  currentStreakDays: number
  exercisesThisWeek: number
}

/** Un punto de la serie de volumen (coincide con DailyVolume del backend). */
export interface DailyVolume {
  date: string
  exercises: number
}

/** Una entrada del historial de progresión de un ejercicio. */
export interface ProgressionEntry {
  date: string
  setsReps: string | null
  notes: string | null
  weightKg: number | null
}

/** Volumen agregado por grupo muscular (coincide con MuscleGroupVolume del backend). */
export interface MuscleGroupVolume {
  muscleGroup: string
  exercises: number
}

export const workoutsApi = {
  findAll: () => apiClient.get<WorkoutSession[]>('/api/workouts'),

  findById: (id: number) => apiClient.get<WorkoutSession>(`/api/workouts/${id}`),

  create: (data: CreateSessionInput) => apiClient.post<WorkoutSession>('/api/workouts', data),

  remove: (id: number) => apiClient.delete<void>(`/api/workouts/${id}`),

  stats: () => apiClient.get<WorkoutStats>('/api/workouts/stats'),

  volume: () => apiClient.get<DailyVolume[]>('/api/workouts/volume'),

  volumeByMuscleGroup: () =>
    apiClient.get<MuscleGroupVolume[]>('/api/workouts/volume-by-muscle-group'),

  progression: (exerciseId: number) =>
    apiClient.get<ProgressionEntry[]>(`/api/workouts/progression/${exerciseId}`),
}
