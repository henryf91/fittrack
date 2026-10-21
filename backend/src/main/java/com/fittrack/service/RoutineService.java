package com.fittrack.service;

import com.fittrack.dto.RoutineDtos.CreateRoutineRequest;
import com.fittrack.dto.RoutineDtos.ExerciseResponse;
import com.fittrack.dto.RoutineDtos.RoutineResponse;
import com.fittrack.model.Exercise;
import com.fittrack.model.Routine;
import com.fittrack.model.RoutineExercise;
import com.fittrack.model.User;
import com.fittrack.repository.ExerciseRepository;
import com.fittrack.repository.RoutineRepository;
import com.fittrack.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * Lógica de negocio de rutinas. Mismo patrón que WorkoutService:
 * el usuario SIEMPRE sale del SecurityContext, y cada consulta filtra
 * por dueño para que nadie acceda a rutinas ajenas.
 */
@Service
public class RoutineService {

    private final RoutineRepository routineRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;

    public RoutineService(RoutineRepository routineRepository,
                          ExerciseRepository exerciseRepository,
                          UserRepository userRepository) {
        this.routineRepository = routineRepository;
        this.exerciseRepository = exerciseRepository;
        this.userRepository = userRepository;
    }

    /** Todas las rutinas del usuario autenticado. */
    @Transactional(readOnly = true)
    public List<RoutineResponse> findAll() {
        Long userId = currentUser().getId();
        return routineRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    /** Crea una rutina con sus ejercicios. */
    @Transactional
    public RoutineResponse create(CreateRoutineRequest request) {
        User user = currentUser();

        Routine routine = new Routine();
        routine.setUser(user);
        routine.setName(request.name());
        routine.setDescription(request.description());

        if (request.exercises() != null) {
            for (CreateRoutineRequest.ExerciseItem item : request.exercises()) {
                routine.getExercises().add(toEntity(routine, item));
            }
        }

        return toResponse(routineRepository.save(routine));
    }

    /** Elimina una rutina del usuario (cascade borra sus ejercicios). */
    @Transactional
    public void delete(Long id) {
        Routine routine = findById(id);
        routineRepository.delete(routine);
    }

    /**
     * Actualiza una rutina del usuario: nombre, descripción y reemplazo
     * completo de la lista de ejercicios (delete + insert con cascade).
     */
    @Transactional
    public RoutineResponse update(Long id, CreateRoutineRequest request) {
        Routine routine = findById(id); // valida dueño

        routine.setName(request.name());
        routine.setDescription(request.description());

        // Reemplazo completo: la colección es cascade ALL + orphanRemoval,
        // así que limpiarla elimina las filas viejas al guardar.
        routine.getExercises().clear();
        if (request.exercises() != null) {
            for (CreateRoutineRequest.ExerciseItem item : request.exercises()) {
                routine.getExercises().add(toEntity(routine, item));
            }
        }

        return toResponse(routineRepository.save(routine));
    }

    // ---------- Helpers ----------

    private RoutineExercise toEntity(Routine routine, CreateRoutineRequest.ExerciseItem item) {
        Exercise exercise = exerciseRepository.findById(item.exerciseId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Ejercicio no existe: " + item.exerciseId()));
        RoutineExercise re = new RoutineExercise();
        re.setRoutine(routine);
        re.setExercise(exercise);
        re.setPosition(item.position());
        re.setSetsReps(item.setsReps());
        re.setNotes(item.notes());
        return re;
    }

    private RoutineResponse toResponse(Routine routine) {
        return new RoutineResponse(
                routine.getId(),
                routine.getName(),
                routine.getDescription(),
                routine.getExercises().stream()
                        .map(this::toExerciseResponse)
                        .toList());
    }

    private ExerciseResponse toExerciseResponse(RoutineExercise re) {
        return new ExerciseResponse(
                re.getId(),
                re.getExercise().getId(),
                re.getExercise().getName(),
                re.getExercise().getCategory(),
                re.getPosition(),
                re.getSetsReps(),
                re.getNotes());
    }

    private Routine findById(Long id) {
        Long userId = currentUser().getId();
        return routineRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rutina no encontrada"));
    }

    /**
     * Usuario autenticado actual. Mismo patrón que WorkoutService:
     * el principal es un UserDetails cuyo username es el email del JWT.
     */
    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = (auth.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails details)
                ? details.getUsername()
                : (String) auth.getPrincipal();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));
    }
}
