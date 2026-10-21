import { apiClient } from './apiClient'
import type { WorkoutSession } from './workoutsApi'

/** Tipos que coinciden con los DTOs de rutinas del backend. */
export interface RoutineExercise {
  id: number
  exerciseId: number
  exerciseName: string
  category: string
  position: number
  setsReps: string | null
  notes: string | null
}

export interface Routine {
  id: number
  name: string
  description: string | null
  exercises: RoutineExercise[]
}

export interface RoutineExerciseInput {
  exerciseId: number
  position: number
  setsReps: string
  notes: string | null
}

export interface CreateRoutineInput {
  name: string
  description: string | null
  exercises: RoutineExerciseInput[]
}

export const routinesApi = {
  findAll: () => apiClient.get<Routine[]>('/api/routines'),

  create: (data: CreateRoutineInput) => apiClient.post<Routine>('/api/routines', data),

  update: (id: number, data: CreateRoutineInput) => apiClient.put<Routine>(`/api/routines/${id}`, data),

  remove: (id: number) => apiClient.delete<void>(`/api/routines/${id}`),

  startSession: (routineId: number) =>
    apiClient.post<WorkoutSession>(`/api/workouts/from-routine/${routineId}`, {}),
}
