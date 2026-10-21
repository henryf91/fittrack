package com.fittrack.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Servicio central de JWT: genera y valida tokens.
 *
 * Flujo típico:
 * 1. Usuario hace login -> generamos un token con su email dentro (el "subject").
 * 2. El frontend guarda el token y lo envía en cada petición:
 *    "Authorization: Bearer <token>".
 * 3. El filtro JWT valida la firma y extrae el usuario.
 */
@org.springframework.stereotype.Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expirationMs;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-ms:86400000}") long expirationMs) {
        // La clave debe tener al menos 256 bits (32 bytes) para HS256.
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    /** Genera un token firmado cuyo subject es el email del usuario. */
    public String generateToken(String email) {
        Date now = new Date();
        return Jwts.builder()
                .subject(email)
                .issuedAt(now)
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(signingKey)
                .compact();
    }

    /** Valida la firma y devuelve el email contenido en el token. Lanza excepción si es inválido. */
    public String validateAndGetEmail(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }
}
