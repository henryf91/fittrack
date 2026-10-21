package com.fittrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTOs de entrenamientos (agrupados en una clase contenedora,
 * igual que AuthDtos).
 */
public class WorkoutDtos {

    /** Un ejercicio dentro de la sesión que envía el cliente. */
    public record SessionExerciseRequest(
            @NotNull Long exerciseId,
            Integer position,
            @Size(max = 200) String setsReps,
            String notes) {
    }

    /** Cuerpo esperado en POST /api/workouts */
    public record CreateSessionRequest(
            java.time.LocalDate sessionDate,
            @NotBlank @Size(max = 120) String name,
            String notes,
            @NotNull java.util.List<SessionExerciseRequest> exercises) {
    }

    /** Respuesta: sesión con sus ejercicios. */
    public record SessionExerciseResponse(
            Long id,
            Long exerciseId,
            String exerciseName,
            String category,
            Integer position,
            String setsReps,
            String notes) {
    }

    public record SessionResponse(
            Long id,
            java.time.LocalDate sessionDate,
            String name,
            String notes,
            java.util.List<SessionExerciseResponse> exercises) {
    }

    /** Respuesta de GET /api/workouts/stats */
    public record StatsResponse(
            long totalSessions,
            long sessionsLast30Days,
            int currentStreakDays,
            long exercisesThisWeek) {
    }

    /** Un punto de la serie de volumen: ejercicios realizados en un día. */
    public record DailyVolume(
            java.time.LocalDate date,
            long exercises) {
    }

    /** Volumen agregado por grupo muscular: ejercicios que lo entrenan. */
    public record MuscleGroupVolume(
            String muscleGroup,
            long exercises) {
    }

    /** Una entrada del historial de progresión de un ejercicio. */
    public record ProgressionEntry(
            java.time.LocalDate date,
            String setsReps,
            String notes,
            Double weightKg) {
    }
}
