-- ============================================================
-- FitTrack - Migración V1: tablas iniciales
-- Flyway ejecuta este script automáticamente al arrancar
-- la aplicación (solo la primera vez, luego lo registra).
-- ============================================================

-- Tabla de usuarios de la app
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100)  NOT NULL,
    email           VARCHAR(150)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255)  NOT NULL,
    role            VARCHAR(20)   NOT NULL DEFAULT 'USER',   -- USER | TRAINER
    weight_kg       NUMERIC(5,2),
    height_cm       NUMERIC(5,1),
    birth_date      DATE,
    fitness_goal    VARCHAR(50),                             -- lose_weight | gain_muscle | endurance
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Email único a nivel de índice (búsquedas rápidas por login)
CREATE UNIQUE INDEX idx_users_email ON users (email);

-- Tabla de ejercicios (biblioteca)
CREATE TABLE exercises (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(120)  NOT NULL,
    category        VARCHAR(30)   NOT NULL,                  -- gym | cardio | calisthenics | outdoor
    muscle_groups   VARCHAR(200)  NOT NULL,                  -- "pecho, triceps" (separado por comas)
    difficulty      VARCHAR(20)   NOT NULL DEFAULT 'beginner', -- beginner | intermediate | advanced
    description     TEXT,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Índices para los filtros de la biblioteca
CREATE INDEX idx_exercises_category ON exercises (category);
CREATE INDEX idx_exercises_muscle_groups ON exercises (muscle_groups);
