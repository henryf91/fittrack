package com.fittrack.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTOs de autenticación (objetos que entran y salen de la API).
 * Los agrupamos en una clase para simplicidad en el sprint.
 */
public class AuthDtos {

    /** Cuerpo esperado en POST /api/auth/register */
    public record RegisterRequest(
            @NotBlank @Size(max = 100) String name,
            @NotBlank @Email @Size(max = 150) String email,
            @NotBlank @Size(min = 8, max = 72) String password) {
    }

    /** Cuerpo esperado en POST /api/auth/login */
    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password) {
    }

    /** Respuesta con el token para ambos casos. */
    public record AuthResponse(String token, String email, String name) {
    }
}
