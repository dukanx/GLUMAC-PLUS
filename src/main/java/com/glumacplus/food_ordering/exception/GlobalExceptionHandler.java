package com.glumacplus.food_ordering.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. ResponseStatusException  (bacaju servisi: NOT_FOUND, BAD_REQUEST...)
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> handleResponseStatus(
            ResponseStatusException ex,
            HttpServletRequest request) {

        ApiError error = new ApiError(
                ex.getStatusCode().value(),
                ex.getReason() != null ? ex.getReason() : ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(ex.getStatusCode()).body(error);
    }

    // 2. Bean Validation (@Valid) — vraća map greški po polju
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        Map<String, String> greske = new HashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            greske.put(fe.getField(), fe.getDefaultMessage());
        }

        ApiError error = new ApiError(
                HttpStatus.BAD_REQUEST.value(),
                "Validacija nije prošla",
                request.getRequestURI(),
                greske
        );
        return ResponseEntity.badRequest().body(error);
    }

    // 3. Neautorizovan pristup (nema tokena / loš token)
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> handleAuth(
            AuthenticationException ex,
            HttpServletRequest request) {

        ApiError error = new ApiError(
                HttpStatus.UNAUTHORIZED.value(),
                "Niste autentifikovani",
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    // 4. Zabranjen pristup (nema uloge)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleForbidden(
            AccessDeniedException ex,
            HttpServletRequest request) {

        ApiError error = new ApiError(
                HttpStatus.FORBIDDEN.value(),
                "Nemate pravo pristupa ovom resursu",
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    // 5. Sve ostale neočekivane greške
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(
            Exception ex,
            HttpServletRequest request) {

        // Loguj za debugging — u produkciji razmisli o SLF4J loggeru
        System.err.println("[GlobalExceptionHandler] Neočekivana greška: " + ex.getMessage());

        ApiError error = new ApiError(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Došlo je do interne greške servera",
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    // ApiError — standardni oblik JSON odgovora za sve greške
    public record ApiError(
            long timestamp,
            int status,
            String message,
            String path,
            Map<String, String> errors
    ) {
        // Konstruktor bez mape grešaka (za većinu slučajeva)
        public ApiError(int status, String message, String path) {
            this(Instant.now().toEpochMilli(), status, message, path, null);
        }

        // Konstruktor sa mapom grešaka (za validacione greške)
        public ApiError(int status, String message, String path, Map<String, String> errors) {
            this(Instant.now().toEpochMilli(), status, message, path, errors);
        }
    }
}
