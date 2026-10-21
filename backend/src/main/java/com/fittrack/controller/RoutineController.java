package com.fittrack.controller;

import com.fittrack.dto.RoutineDtos.CreateRoutineRequest;
import com.fittrack.dto.RoutineDtos.RoutineResponse;
import com.fittrack.service.RoutineService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Endpoints de rutinas bajo /api/routines. Todos requieren JWT
 * (lo exige SecurityConfig) y operan solo sobre el usuario autenticado.
 */
@RestController
@RequestMapping("/api/routines")
public class RoutineController {

    private final RoutineService routineService;

    public RoutineController(RoutineService routineService) {
        this.routineService = routineService;
    }

    /** GET /api/routines — rutinas del usuario autenticado. */
    @GetMapping
    public List<RoutineResponse> findAll() {
        return routineService.findAll();
    }

    /** POST /api/routines — crea una rutina con sus ejercicios. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoutineResponse create(@jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody CreateRoutineRequest request) {
        return routineService.create(request);
    }

    /** PUT /api/routines/{id} — actualiza nombre y ejercicios de una rutina. */
    @PutMapping("/{id}")
    public RoutineResponse update(@PathVariable Long id,
                                  @jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody CreateRoutineRequest request) {
        return routineService.update(id, request);
    }

    /** DELETE /api/routines/{id} — elimina una rutina del usuario. */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        routineService.delete(id);
    }
}
