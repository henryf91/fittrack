package com.fittrack.repository;

import com.fittrack.model.WorkoutSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio de sesiones de entrenamiento.
 * Los métodos con "UserId" filtran por dueño — clave para que un usuario
 * nunca vea ni modifique las sesiones de otro (seguridad a nivel de datos).
 */
public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {

    /** Todas las sesiones de un usuario, más recientes primero. */
    java.util.List<WorkoutSession> findByUserIdOrderBySessionDateDesc(Long userId);

    /** Una sesión por id, verificando el dueño. */
    java.util.Optional<WorkoutSession> findByIdAndUserId(Long id, Long userId);
}
