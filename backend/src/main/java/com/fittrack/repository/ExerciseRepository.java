package com.fittrack.repository;

import com.fittrack.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repositorio de la biblioteca de ejercicios.
 */
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

    List<Exercise> findByCategory(String category);

    List<Exercise> findByDifficulty(String difficulty);

    List<Exercise> findByNameContainingIgnoreCase(String name);
}
