package com.fittrack.repository;

import com.fittrack.model.Routine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio de rutinas. Igual que en workouts: los métodos con "UserId"
 * filtran por dueño para que un usuario nunca vea las rutinas de otro.
 */
public interface RoutineRepository extends JpaRepository<Routine, Long> {

    /** Todas las rutinas de un usuario, más recientes primero. */
    List<Routine> findByUserIdOrderByCreatedAtDesc(Long userId);

    /** Una rutina por id, verificando el dueño. */
    Optional<Routine> findByIdAndUserId(Long id, Long userId);
}
