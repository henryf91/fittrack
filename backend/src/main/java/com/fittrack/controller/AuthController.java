package com.fittrack.controller;

import com.fittrack.dto.AuthDtos.AuthResponse;
import com.fittrack.dto.AuthDtos.LoginRequest;
import com.fittrack.dto.AuthDtos.RegisterRequest;
import com.fittrack.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints públicos de autenticación.
 *
 * POST /api/auth/register -> crea cuenta y devuelve JWT
 * POST /api/auth/login    -> valida credenciales y devuelve JWT
 */
@org.springframework.web.bind.annotation.RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
