package com.fittrack.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Entidad JPA que mapea la tabla "exercises" (biblioteca de ejercicios).
 */
@Getter
@Setter
@Entity
@Table(name = "exercises")
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    /** gym | cardio | calisthenics | outdoor */
    @Column(nullable = false, length = 30)
    private String category;

    /** "pecho, triceps" — separado por comas para simplicidad. */
    @Column(name = "muscle_groups", nullable = false, length = 200)
    private String muscleGroups;

    /** beginner | intermediate | advanced */
    @Column(nullable = false, length = 20)
    private String difficulty = "beginner";

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
