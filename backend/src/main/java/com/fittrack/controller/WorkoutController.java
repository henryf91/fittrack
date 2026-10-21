package com.fittrack.controller;

import com.fittrack.model.WorkoutSession;
import com.fittrack.service.WorkoutService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API REST de sesiones de entrenamiento.
 * Todas las rutas requieren JWT y operan solo sobre las sesiones
 * del usuario autenticado.
 */
@org.springframework.web.bind.annotation.RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    private final WorkoutService workoutService;

    public WorkoutController(WorkoutService workoutService) {
        this.workoutService = workoutService;
    }

    /** GET /api/workouts — sesiones del usuario, más recientes primero. */
    @GetMapping
    public Iterable<com.fittrack.model.WorkoutSession> findAll() {
        return workoutService.findMySessions();
    }

    /** GET /api/workouts/{id} — una sesión con sus ejercicios. */
    @GetMapping("/{id}")
    public com.fittrack.model.WorkoutSession findById(@PathVariable Long id) {
        return workoutService.findById(id);
    }

    /** POST /api/workouts — crea una sesión con sus ejercicios. */
    @PostMapping
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.CREATED)
    public com.fittrack.model.WorkoutSession create(
            @jakarta.validation.Valid @RequestBody com.fittrack.dto.WorkoutDtos.CreateSessionRequest request) {
        return workoutService.create(request);
    }

    /** DELETE /api/workouts/{id} — elimina una sesión del usuario. */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        workoutService.delete(id);
    }

    /** GET /api/workouts/stats — estadísticas del usuario autenticado. */
    @GetMapping("/stats")
    public com.fittrack.dto.WorkoutDtos.StatsResponse stats() {
        return workoutService.getStats();
    }

    /** GET /api/workouts/volume — volumen diario de las últimas 8 semanas. */
    @GetMapping("/volume")
    public java.util.List<com.fittrack.dto.WorkoutDtos.DailyVolume> volume() {
        return workoutService.getWeeklyVolume();
    }

    /** POST /api/workouts/from-routine/{routineId} — crea una sesión de hoy desde una rutina. */
    @PostMapping("/from-routine/{routineId}")
    @ResponseStatus(HttpStatus.CREATED)
    public com.fittrack.model.WorkoutSession createFromRoutine(@PathVariable Long routineId) {
        return workoutService.createFromRoutine(routineId);
    }

    /** GET /api/workouts/progression/{exerciseId} — historial de sets/reps de un ejercicio. */
    @GetMapping("/progression/{exerciseId}")
    public java.util.List<com.fittrack.dto.WorkoutDtos.ProgressionEntry> progression(@PathVariable Long exerciseId) {
        return workoutService.getProgression(exerciseId);
    }
}
