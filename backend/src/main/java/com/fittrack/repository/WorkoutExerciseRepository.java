package com.fittrack.repository;

import com.fittrack.model.WorkoutExercise;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repositorio de ejercicios dentro de sesiones.
 * Se accede principalmente a través de WorkoutSession (cascade),
 * pero el repositorio es útil para consultas directas.
 */
public interface WorkoutExerciseRepository extends JpaRepository<WorkoutExercise, Long> {
}
