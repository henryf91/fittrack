-- ============================================================
-- FitTrack - Migración V2: registro de entrenamientos
-- workout_sessions: una sesión de entrenamiento del usuario
--   (fecha, notas, duración)
-- workout_exercises: cada ejercicio realizado dentro de una sesión
--   (series, repeticiones, peso)
-- ============================================================

-- Sesiones de entrenamiento
CREATE TABLE workout_sessions (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    name            VARCHAR(120),
    notes           TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON workout_sessions(user_id);
CREATE INDEX idx_sessions_date ON workout_sessions(session_date);

-- Ejercicios realizados dentro de una sesión
CREATE TABLE workout_exercises (
    id              BIGSERIAL PRIMARY KEY,
    session_id      BIGINT NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
    exercise_id     BIGINT NOT NULL REFERENCES exercises(id),
    -- Orden del ejercicio dentro de la sesión (para mostrarlos en orden)
    position        INT NOT NULL DEFAULT 0,
    -- Detalles en texto libre: "3x10 @ 60kg" o "20 min, 5km"
    sets_reps       VARCHAR(200),
    notes           TEXT
);

CREATE INDEX idx_wexercises_session ON workout_exercises(session_id);
CREATE INDEX idx_wexercises_exercise ON workout_exercises(exercise_id);
