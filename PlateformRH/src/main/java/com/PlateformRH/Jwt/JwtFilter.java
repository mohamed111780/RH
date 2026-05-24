package com.PlateformRH.Jwt;

import com.PlateformRH.Utilisateur.UtilisateurServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Objects;

@RequiredArgsConstructor
@Service
public class JwtFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private  final UtilisateurServiceImpl userService;


    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String token = null;
        String username = null;
        boolean isTokenExpired = true;
        Jwt tokenDansLaBase = null;

        final String authorization = request.getHeader("Authorization");

        if (authorization != null && authorization.startsWith("Bearer ")) {
            token = authorization.substring(7);
            try {                                        // ← try/catch ajouté
                tokenDansLaBase = jwtService.tokenByValeur(token);
                isTokenExpired  = jwtService.isTokenExpired(token);
                username        = jwtService.extractUsername(token);
            } catch (Exception e) {
                // Token invalide ou introuvable → on laisse passer,
                // Spring Security bloquera si la route est protégée
                filterChain.doFilter(request, response);
                return;
            }
        }

        if (!isTokenExpired
                && username != null
                && tokenDansLaBase != null                // ← null check ajouté
                && Objects.equals(tokenDansLaBase.getUser().getEmail(), username)
                && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = userService.loadUserByUsername(username);
            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        }

        filterChain.doFilter(request, response);
    }

    // ← Ajouter cette méthode pour bypasser le filtre sur les routes publiques
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.equals("/utilisateurs/login")
                || path.equals("/utilisateurs/demande-mot-de-passe")
                || path.equals("/utilisateurs/validate-code")
                || path.equals("/utilisateurs/change-password");
    }



}
