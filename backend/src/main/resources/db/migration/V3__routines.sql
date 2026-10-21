-- ============================================================
-- FitTrack - Migración V3: plantillas de rutinas
-- routines: una rutina reutilizable del usuario
--   (nombre, descripción, objetivo)
-- routine_exercises: cada ejercicio de la rutina
--   (orden, series/reps planificadas)
-- ============================================================

-- Plantillas de rutinas
CREATE TABLE routines (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(120) NOT NULL,
    description     TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_routines_user ON routines(user_id);

-- Ejercicios planificados dentro de una rutina
CREATE TABLE routine_exercises (
    id              BIGSERIAL PRIMARY KEY,
    routine_id      BIGINT NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    exercise_id     BIGINT NOT NULL REFERENCES exercises(id),
    -- Orden del ejercicio dentro de la rutina
    position        INT NOT NULL DEFAULT 0,
    -- Plan: "4x8 @ 100kg" o "3 series al fallo"
    sets_reps       VARCHAR(200),
    notes           TEXT
);

CREATE INDEX idx_rexercises_routine ON routine_exercises(routine_id);
CREATE INDEX idx_rexercises_exercise ON routine_exercises(exercise_id);
