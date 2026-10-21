import { apiClient } from './apiClient'

/** Tipos que coinciden con la entidad Exercise del backend. */
export interface Exercise {
  id: number
  name: string
  category: 'gym' | 'cardio' | 'calisthenics' | 'outdoor'
  muscleGroups: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  description: string | null
  createdAt: string
}

export interface ExerciseInput {
  name: string
  category: Exercise['category']
  muscleGroups: string
  difficulty: Exercise['difficulty']
  description: string | null
}

export const exercisesApi = {
  findAll: () => apiClient.get<Exercise[]>('/api/exercises'),

  create: (data: ExerciseInput) => apiClient.post<Exercise>('/api/exercises', data),

  update: (id: number, data: ExerciseInput) =>
    apiClient.put<Exercise>(`/api/exercises/${id}`, data),

  remove: (id: number) => apiClient.delete<void>(`/api/exercises/${id}`),
}
