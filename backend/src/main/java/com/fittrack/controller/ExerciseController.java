package com.fittrack.controller;

import com.fittrack.model.Exercise;
import com.fittrack.service.ExerciseService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API REST de la biblioteca de ejercicios.
 * Todas las rutas requieren JWT (solo /api/auth/** es público).
 */
@org.springframework.web.bind.annotation.RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    private final ExerciseService exerciseService;

    public ExerciseController(ExerciseService exerciseService) {
        this.exerciseService = exerciseService;
    }

    /** GET /api/exercises — lista todos. */
    @GetMapping
    public Iterable<Exercise> findAll() {
        return exerciseService.findAll();
    }

    /** GET /api/exercises/{id} — busca por id. */
    @GetMapping("/{id}")
    public Exercise findById(@PathVariable Long id) {
        return exerciseService.findById(id);
    }

    /** POST /api/exercises — crea un ejercicio. */
    @PostMapping
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.CREATED)
    public Exercise create(@RequestBody Exercise exercise) {
        return exerciseService.create(exercise);
    }

    /** PUT /api/exercises/{id} — actualiza. */
    @PutMapping("/{id}")
    public Exercise update(@PathVariable Long id, @RequestBody Exercise changes) {
        return exerciseService.update(id, changes);
    }

    /** DELETE /api/exercises/{id} — elimina. */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        exerciseService.delete(id);
    }
}
