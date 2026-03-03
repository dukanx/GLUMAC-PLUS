package com.glumacplus.food_ordering.config;

import com.glumacplus.food_ordering.service.JwtService;
import com.glumacplus.food_ordering.security.CustomUserDetailsService;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // 1. Proveravamo da li header postoji i da li pocinje sa "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // 2. Izvlacimo sam token (sve posle "Bearer ")
            jwt = authHeader.substring(7);

            // 3. Vadimo email iz tokena
            userEmail = jwtService.extractUsername(jwt);
        } catch (JwtException | IllegalArgumentException ex) {
            // Invalidan token tretiramo kao neautorizovan zahtev bez rušenja API-ja.
            filterChain.doFilter(request, response);
            return;
        }

        // 4. Ako imamo email i korisnik vec nije ulogovan u ovom kontekstu
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                // 5. Proveravamo validnost tokena
                if (jwtService.isTokenValid(jwt, userDetails)) {

                    // 6. Pravimo Authentication objekat i ubacujemo ga u Spring Context
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (JwtException | IllegalArgumentException | UsernameNotFoundException ex) {
                // Token postoji, ali nije upotrebljiv za autentikaciju; nastavljamo kao anonimni korisnik.
                SecurityContextHolder.clearContext();
            }
        }

        // Nastavi dalje ka kontrolerima
        filterChain.doFilter(request, response);
    }
}
