package com.fittrack.service;

import com.fittrack.model.Exercise;
import com.fittrack.repository.ExerciseRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * Lógica de negocio de la biblioteca de ejercicios.
 * Todos los métodos asumen que el usuario ya está autenticado con JWT
 * (Spring Security lo garantiza antes de llegar aquí).
 */
@Service
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;

    public ExerciseService(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    /** Lista todos los ejercicios de la biblioteca. */
    public List<Exercise> findAll() {
        return exerciseRepository.findAll();
    }

    /** Busca un ejercicio por id, o lanza 404. */
    public Exercise findById(Long id) {
        return exerciseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ejercicio no encontrado"));
    }

    /** Crea un nuevo ejercicio. */
    public Exercise create(Exercise exercise) {
        exercise.setId(null); // JPA debe generar el id, no confiar en el cliente
        return exerciseRepository.save(exercise);
    }

    /** Actualiza un ejercicio existente, o lanza 404. */
    public Exercise update(Long id, Exercise changes) {
        Exercise existing = findById(id);
        existing.setName(changes.getName());
        existing.setCategory(changes.getCategory());
        existing.setMuscleGroups(changes.getMuscleGroups());
        existing.setDifficulty(changes.getDifficulty());
        existing.setDescription(changes.getDescription());
        return exerciseRepository.save(existing);
    }

    /** Elimina un ejercicio, o lanza 404. */
    public void delete(Long id) {
        if (!exerciseRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ejercicio no encontrado");
        }
        exerciseRepository.deleteById(id);
    }
}
