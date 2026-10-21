package com.fittrack.repository;

import com.fittrack.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repositorio de usuarios.
 * Spring Data JPA genera la implementación automáticamente:
 * solo declaramos los métodos de búsqueda que necesitamos.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    /** Spring genera el SQL automáticamente a partir del nombre del método. */
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
