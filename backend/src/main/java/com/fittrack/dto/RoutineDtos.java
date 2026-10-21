package com.fittrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTOs de rutinas (agrupados en una clase contenedora, como WorkoutDtos).
 */
public class RoutineDtos {

    private RoutineDtos() {
    }

    // ---------- Requests ----------

    public record CreateRoutineRequest(
            @NotBlank @Size(max = 120) String name,
            String description,
            @Size(max = 50) java.util.List<ExerciseItem> exercises) {

        public record ExerciseItem(
                @NotNull Long exerciseId,
                int position,
                @Size(max = 200) String setsReps,
                String notes) {
        }
    }

    // ---------- Responses ----------

    public record ExerciseResponse(
            Long id,
            Long exerciseId,
            String exerciseName,
            String category,
            int position,
            String setsReps,
            String notes) {
    }

    public record RoutineResponse(
            Long id,
            String name,
            String description,
            java.util.List<ExerciseResponse> exercises) {
    }
}
