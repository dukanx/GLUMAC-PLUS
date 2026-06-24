package com.glumacplus.food_ordering.service;

import com.glumacplus.food_ordering.dto.AuthenticationRequest;
import com.glumacplus.food_ordering.dto.AuthenticationResponse;
import com.glumacplus.food_ordering.model.Korisnik;
import com.glumacplus.food_ordering.model.Uloga;
import com.glumacplus.food_ordering.repository.KorisnikRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    KorisnikRepository korisnikRepository;

    @Mock
    JwtService jwtService;

    @Mock
    AuthenticationManager authenticationManager;

    @InjectMocks
    AuthenticationService authenticationService;

    // SO: authenticate

    @Test
    void testAuthenticateUspesnoVracaToken() {
        AuthenticationRequest request = new AuthenticationRequest("korisnik@gmail.com", "lozinka123");

        Korisnik korisnik = new Korisnik("Nikola", "korisnik@gmail.com", "kodirano", 0, Uloga.KORISNIK);
        korisnik.setId(1L);

        when(authenticationManager.authenticate(any())).thenReturn(mock(Authentication.class));
        when(korisnikRepository.findByEmail("korisnik@gmail.com")).thenReturn(Optional.of(korisnik));
        when(jwtService.generateToken(any())).thenReturn("jwt-token");

        AuthenticationResponse result = authenticationService.authenticate(request);

        assertEquals("jwt-token", result.getToken());
        assertEquals(1L, result.getKorisnik().getId());
        assertEquals("korisnik@gmail.com", result.getKorisnik().getEmail());
        assertEquals(Uloga.KORISNIK, result.getKorisnik().getUloga());

        verify(authenticationManager).authenticate(any());
        verify(korisnikRepository).findByEmail("korisnik@gmail.com");
        verify(jwtService).generateToken(any());
    }

    @Test
    void testAuthenticatePogresnaLozinkaBaca401() {
        AuthenticationRequest request = new AuthenticationRequest("korisnik@gmail.com", "pogresna");

        doThrow(new BadCredentialsException("Bad credentials"))
                .when(authenticationManager).authenticate(any());

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> authenticationService.authenticate(request)
        );

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
    }
}
