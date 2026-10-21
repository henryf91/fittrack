package com.fittrack.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entidad JPA que mapea la tabla "routine_exercises".
 * Un ejercicio planificado dentro de una rutina.
 */
@Getter
@Setter
@Entity
@Table(name = "routine_exercises")
public class RoutineExercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "routine_id", nullable = false)
    private Routine routine;

    /** Ejercicio de la biblioteca que se planifica. */
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Column(nullable = false)
    private int position;

    /** Plan: "4x8 @ 100kg" o "3 series al fallo". */
    @Column(name = "sets_reps", length = 200)
    private String setsReps;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
