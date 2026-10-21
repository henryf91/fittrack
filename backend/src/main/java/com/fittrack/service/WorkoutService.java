package com.fittrack.service;

import com.fittrack.dto.WorkoutDtos.CreateSessionRequest;
import com.fittrack.dto.WorkoutDtos.DailyVolume;
import com.fittrack.dto.WorkoutDtos.ProgressionEntry;
import com.fittrack.dto.WorkoutDtos.SessionExerciseResponse;
import com.fittrack.dto.WorkoutDtos.SessionResponse;
import com.fittrack.dto.WorkoutDtos.StatsResponse;
import com.fittrack.model.Exercise;
import com.fittrack.model.Routine;
import com.fittrack.model.RoutineExercise;
import com.fittrack.model.User;
import com.fittrack.model.WorkoutExercise;
import com.fittrack.model.WorkoutSession;
import com.fittrack.repository.ExerciseRepository;
import com.fittrack.repository.RoutineRepository;
import com.fittrack.repository.UserRepository;
import com.fittrack.repository.WorkoutSessionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.time.DayOfWeek;
import java.time.LocalDate;

/**
 * Lógica de negocio de sesiones de entrenamiento.
 *
 * Seguridad: el usuario SIEMPRE se obtiene del SecurityContext (lo llena
 * el JwtAuthenticationFilter), nunca del cuerpo de la petición. Así un
 * cliente no puede crear ni leer sesiones de otro usuario.
 */
@Service
public class WorkoutService {

    private final WorkoutSessionRepository sessionRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;
    private final RoutineRepository routineRepository;

    public WorkoutService(WorkoutSessionRepository sessionRepository,
                          ExerciseRepository exerciseRepository,
                          UserRepository userRepository,
                          RoutineRepository routineRepository) {
        this.sessionRepository = sessionRepository;
        this.exerciseRepository = exerciseRepository;
        this.userRepository = userRepository;
        this.routineRepository = routineRepository;
    }

    /**
     * Usuario autenticado actual. El principal lo llena el JwtAuthenticationFilter:
     * es un UserDetails cuyo username es el email del JWT. Lo cargamos de la BD.
     */
    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = (auth.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails details)
                ? details.getUsername()
                : (String) auth.getPrincipal();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));
    }

    /** Lista las sesiones del usuario autenticado. */
    @Transactional(readOnly = true)
    public List<WorkoutSession> findMySessions() {
        return sessionRepository.findByUserIdOrderBySessionDateDesc(currentUser().getId());
    }

    /** Una sesión del usuario, o 404 (también si es de otro usuario). */
    @Transactional(readOnly = true)
    public WorkoutSession findById(Long id) {
        return sessionRepository.findByIdAndUserId(id, currentUser().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sesión no encontrada"));
    }

    /** Crea una sesión con sus ejercicios (una sola transacción). */
    @Transactional
    public WorkoutSession create(CreateSessionRequest request) {
        WorkoutSession session = new WorkoutSession();
        session.setUser(currentUser()); // dueño = usuario del JWT
        session.setSessionDate(request.sessionDate() != null ? request.sessionDate() : java.time.LocalDate.now());
        session.setName(request.name());
        session.setNotes(request.notes());

        for (var ex : request.exercises()) {
            Exercise exercise = exerciseRepository.findById(ex.exerciseId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Ejercicio " + ex.exerciseId() + " no existe"));
            WorkoutExercise we = new WorkoutExercise();
            we.setSession(session);
            we.setExercise(exercise);
            we.setPosition(ex.position() != null ? ex.position() : 0);
            we.setSetsReps(ex.setsReps());
            we.setNotes(ex.notes());
            session.getExercises().add(we);
        }

        return sessionRepository.save(session); // cascade guarda los ejercicios
    }

    /** Elimina una sesión del usuario (cascade borra sus ejercicios). */
    @Transactional
    public void delete(Long id) {
        WorkoutSession session = findById(id); // valida dueño
        sessionRepository.delete(session);
    }

    /**
     * Crea una sesión de HOY a partir de una rutina del usuario: copia el
     * nombre y los ejercicios planificados (orden, sets/reps y notas).
     * La rutina debe ser del usuario autenticado (404 si no).
     */
    @Transactional
    public WorkoutSession createFromRoutine(Long routineId) {
        Long userId = currentUser().getId();
        Routine routine = routineRepository.findByIdAndUserId(routineId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rutina no encontrada"));

        WorkoutSession session = new WorkoutSession();
        session.setUser(routine.getUser());
        session.setSessionDate(java.time.LocalDate.now());
        session.setName(routine.getName());
        session.setNotes(routine.getDescription());

        for (RoutineExercise re : routine.getExercises()) {
            WorkoutExercise we = new WorkoutExercise();
            we.setSession(session);
            we.setExercise(re.getExercise());
            we.setPosition(re.getPosition());
            we.setSetsReps(re.getSetsReps());
            we.setNotes(re.getNotes());
            session.getExercises().add(we);
        }

        return sessionRepository.save(session); // cascade guarda los ejercicios
    }

    /**
     * Estadísticas del usuario: total de sesiones, sesiones en los últimos
     * 30 días, racha actual de días consecutivos entrenando y ejercicios
     * de la semana en curso (lunes a domingo).
     */
    @Transactional(readOnly = true)
    public StatsResponse getStats() {
        Long userId = currentUser().getId();
        List<WorkoutSession> sessions = sessionRepository.findByUserIdOrderBySessionDateDesc(userId);

        LocalDate today = LocalDate.now();
        LocalDate thirtyDaysAgo = today.minusDays(30);

        long sessionsLast30 = sessions.stream()
                .filter(s -> !s.getSessionDate().isBefore(thirtyDaysAgo))
                .count();

        // Racha: días consecutivos con al menos una sesión, terminando hoy
        // (o ayer, si hoy aún no entrenó — así la racha no "se rompe" durante el día).
        Set<LocalDate> trainingDays = sessions.stream()
                .map(WorkoutSession::getSessionDate)
                .collect(Collectors.toSet());
        int streak = 0;
        LocalDate cursor = trainingDays.contains(today) ? today : today.minusDays(1);
        while (trainingDays.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }

        // Semana en curso: de lunes a domingo
        LocalDate monday = today.with(DayOfWeek.MONDAY);
        long exercisesThisWeek = sessions.stream()
                .filter(s -> !s.getSessionDate().isBefore(monday))
                .flatMap(s -> s.getExercises().stream())
                .count();

        return new StatsResponse(sessions.size(), sessionsLast30, streak, exercisesThisWeek);
    }

    /**
     * Volumen diario de las últimas 8 semanas: número de ejercicios
     * realizados por día (solo días con actividad).
     */
    @Transactional(readOnly = true)
    public List<DailyVolume> getWeeklyVolume() {
        Long userId = currentUser().getId();
        LocalDate since = LocalDate.now().minusWeeks(8);

        return sessionRepository.findByUserIdOrderBySessionDateDesc(userId).stream()
                .filter(s -> !s.getSessionDate().isBefore(since))
                .map(s -> new DailyVolume(
                        s.getSessionDate(),
                        s.getExercises().size()))
                .toList();
    }

    /**
     * Historial de progresión de un ejercicio: entradas (fecha, sets/reps,
     * notas) de todas las sesiones del usuario que lo incluyeron, de la
     * más antigua a la más reciente — para ver si sube de peso.
     */
    @Transactional(readOnly = true)
    public List<ProgressionEntry> getProgression(Long exerciseId) {
        Long userId = currentUser().getId();
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ejercicio no encontrado"));

        return sessionRepository.findByUserIdOrderBySessionDateDesc(userId).stream()
                .sorted((a, b) -> a.getSessionDate().compareTo(b.getSessionDate())) // más antiguas primero
                .flatMap(s -> s.getExercises().stream()
                        .filter(we -> we.getExercise().getId().equals(exerciseId))
                        .map(we -> new ProgressionEntry(
                                we.getSession().getSessionDate(),
                                we.getSetsReps(),
                                we.getNotes(),
                                parseWeightKg(we.getSetsReps()))))
                .toList();
    }

    /**
     * Extrae el peso numérico de un texto tipo "3x8 @ 100kg" → 100.0.
     * Devuelve null si no hay peso (p. ej. "20 min, 5km") — la gráfica
     * omite esos puntos.
     */
    private static Double parseWeightKg(String setsReps) {
        if (setsReps == null) {
            return null;
        }
        var matcher = java.util.regex.Pattern
                .compile("@\\s*([0-9]+(?:\\.[0-9]+)?)\\s*kg", java.util.regex.Pattern.CASE_INSENSITIVE)
                .matcher(setsReps);
        return matcher.find() ? Double.parseDouble(matcher.group(1)) : null;
    }
}
