package com.fittrack.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad JPA que mapea la tabla "workout_sessions".
 * Una sesión de entrenamiento del usuario, con sus ejercicios.
 */
@Getter
@Setter
@Entity
@Table(name = "workout_sessions")
public class WorkoutSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Dueño de la sesión (se toma del JWT, nunca del cliente). */
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "session_date", nullable = false)
    private java.time.LocalDate sessionDate = LocalDate.now();

    @Column(length = 120)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Ejercicios de la sesión. "cascade = ALL" -> al guardar la sesión
     * se guardan sus ejercicios; "orphanRemoval" -> al quitar un ejercicio
     * de la lista se elimina de la BD.
     */
    @OneToMany(
            mappedBy = "session",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.EAGER
    )
    @OrderBy("position ASC")
    private List<WorkoutExercise> exercises = new java.util.ArrayList<>();

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (sessionDate == null) {
            sessionDate = LocalDate.now();
        }
    }
}
