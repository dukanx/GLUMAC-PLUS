package com.glumacplus.food_ordering.config;

import com.glumacplus.food_ordering.security.CustomUserDetailsService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final List<String> allowedOriginPatterns;

    public SecurityConfig(
            CustomUserDetailsService userDetailsService,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            @Value("${app.cors.allowed-origin-patterns}") String allowedOriginPatternsProperty) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.allowedOriginPatterns = Arrays.stream(allowedOriginPatternsProperty.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/error", "/error/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/korisnici").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/proizvodi").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/proizvodi/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/alergeni").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/alergeni/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/radno-vreme").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/radno-vreme/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/loyalty_program/**").permitAll()
                        .anyRequest().authenticated())
                // Kazemo Springu da NE cuva sesiju (jer koristimo tokene, svaki request je
                // poseban)
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Bez ovoga Spring na oba slučaja vraća 403, pa frontend ne može da
                // razlikuje istekao token (treba odjava) od nedovoljne uloge (ne treba).
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> posaljiGresku(res,
                                HttpServletResponse.SC_UNAUTHORIZED,
                                "Sesija je istekla. Prijavi se ponovo."))
                        .accessDeniedHandler((req, res, e) -> posaljiGresku(res,
                                HttpServletResponse.SC_FORBIDDEN,
                                "Nemaš dozvolu za ovu akciju.")))
                .authenticationProvider(authenticationProvider())
                // Ubacujemo nas filter pre standardnog filtera
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Piše grešku u istom JSON obliku kakav frontend čita iz ostalih odgovora
     * ({@code message}), da klijent ne mora posebno da barata sigurnosnim greškama.
     */
    private static void posaljiGresku(HttpServletResponse res, int status, String poruka) throws IOException {
        res.setStatus(status);
        res.setContentType("application/json;charset=UTF-8");
        res.getWriter().write("{\"status\":" + status + ",\"message\":\"" + poruka + "\"}");
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(allowedOriginPatterns);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}
