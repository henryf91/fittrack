package com.fittrack.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entidad JPA que mapea la tabla "users" de la BD.
 * Cada anotación @Column conecta el campo Java con la columna SQL.
 * Lombok (@Getter/@Setter) genera los getters/setters por nosotros.
 */
@Getter
@Setter
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    /** Guardamos el hash, nunca la contraseña en texto plano. */
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    /** USER o TRAINER — se guarda como string, no enum de Java, para simplicidad. */
    @Column(nullable = false, length = 20)
    private String role = "USER";

    @Column(name = "weight_kg", precision = 5, scale = 2)
    private BigDecimal weightKg;

    @Column(name = "height_cm", scale = 1)
    private BigDecimal heightCm;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "fitness_goal", length = 50)
    private String fitnessGoal;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
