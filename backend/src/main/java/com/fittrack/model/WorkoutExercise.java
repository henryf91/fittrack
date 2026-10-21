package com.fittrack.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entidad JPA que mapea la tabla "workout_exercises".
 * Un ejercicio realizado dentro de una sesión de entrenamiento.
 */
@Getter
@Setter
@Entity
@Table(name = "workout_exercises")
public class WorkoutExercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Sesión a la que pertenece (lado inverso de la relación). */
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private WorkoutSession session;

    /** Ejercicio de la biblioteca (referencia, no se borra en cascada). */
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    /** Orden dentro de la sesión. */
    @Column(nullable = false)
    private Integer position = 0;

    /** Detalles en texto libre: "3x10 @ 60kg" o "20 min, 5km". */
    @Column(name = "sets_reps", length = 200)
    private String setsReps;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
