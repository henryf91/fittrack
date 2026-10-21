package com.fittrack.service;

import com.fittrack.dto.AuthDtos.AuthResponse;
import com.fittrack.dto.AuthDtos.LoginRequest;
import com.fittrack.dto.AuthDtos.RegisterRequest;
import com.fittrack.model.User;
import com.fittrack.repository.UserRepository;
import com.fittrack.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Lógica de negocio de autenticación.
 *
 * - register: valida que el email no exista, hashea la contraseña, guarda y devuelve token.
 * - login: busca el usuario, compara el hash con BCrypt y devuelve el token.
 */
@org.springframework.stereotype.Service
public class AuthService {

    private final UserRepository userRepository;
    private final com.fittrack.security.JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(com.fittrack.repository.UserRepository userRepository,
                       com.fittrack.security.JwtService jwtService,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El email ya está registrado");
        }

        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole("USER");
        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getName());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas");
        }

        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getName());
    }
}
