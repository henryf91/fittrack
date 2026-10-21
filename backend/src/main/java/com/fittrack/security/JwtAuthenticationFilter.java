package com.fittrack.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Filtro que corre UNA vez por cada petición HTTP.
 *
 * Si la petición trae "Authorization: Bearer <token>":
 * 1. Valida el token con JwtService.
 * 2. Si es válido, guarda la autenticación en el SecurityContext.
 * 3. La petición continúa hacia el controller correspondiente.
 */
@Component
public class JwtAuthenticationFilter extends org.springframework.web.filter.OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws java.io.IOException, jakarta.servlet.ServletException {

        String authHeader = request.getHeader("Authorization");

        // Sin header Bearer -> continúa sin autenticar (las rutas públicas lo permiten)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7); // quita "Bearer "
        try {
            String email = jwtService.validateAndGetEmail(token);

            UserDetails userDetails = new User(email, "", List.of());
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userDetails, null, List.of());
            authentication.setDetails(new org.springframework.security.web.authentication.WebAuthenticationDetailsSource().buildDetails(request));

            org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (io.jsonwebtoken.JwtException e) {
            // Token inválido o expirado -> la petición sigue sin autenticar.
            // Spring Security devolverá 401 en las rutas protegidas.
        }

        filterChain.doFilter(request, response);
    }
}
