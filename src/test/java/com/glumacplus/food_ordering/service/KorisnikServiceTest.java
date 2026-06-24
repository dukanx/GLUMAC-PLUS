package com.glumacplus.food_ordering.service;

import com.glumacplus.food_ordering.dto.KorisnikDto;
import com.glumacplus.food_ordering.dto.KorisnikViewDto;
import com.glumacplus.food_ordering.model.Korisnik;
import com.glumacplus.food_ordering.model.LoyaltyProgram;
import com.glumacplus.food_ordering.model.Uloga;
import com.glumacplus.food_ordering.repository.KorisnikRepository;
import com.glumacplus.food_ordering.repository.LoyaltyProgramRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class KorisnikServiceTest {

    @Mock
    KorisnikRepository korisnikRepo;

    @Mock
    LoyaltyProgramRepository loyaltyRepo;

    @Mock
    PasswordEncoder passwordEncoder;

    @InjectMocks
    KorisnikService korisnikService;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void setupSecurityContext(String email) {
        Authentication auth = mock(Authentication.class);
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(auth);
        when(auth.getName()).thenReturn(email);
        SecurityContextHolder.setContext(ctx);
    }

    // SO: create

    @Test
    void testCreateUspesnoVracaKorisnika() {
        KorisnikDto dto = new KorisnikDto();
        dto.setIme("Nikola");
        dto.setEmail("nikola@gmail.com");
        dto.setLozinka("lozinka123");

        LoyaltyProgram novaZvezda = new LoyaltyProgram("Nova zvezda", 0.0, 0);
        Korisnik saved = new Korisnik("Nikola", "nikola@gmail.com", "kodirano", 0, Uloga.KORISNIK);
        saved.setId(1L);
        saved.setLoyaltyProgram(novaZvezda);

        when(korisnikRepo.existsByEmail("nikola@gmail.com")).thenReturn(false);
        when(loyaltyRepo.findByNivo("Nova zvezda")).thenReturn(Optional.of(novaZvezda));
        when(passwordEncoder.encode("lozinka123")).thenReturn("kodirano");
        when(korisnikRepo.save(any(Korisnik.class))).thenReturn(saved);

        KorisnikViewDto result = korisnikService.create(dto);


        ArgumentCaptor<Korisnik> captor = ArgumentCaptor.forClass(Korisnik.class);
        verify(korisnikRepo).save(captor.capture());
        Korisnik zaSnimanje = captor.getValue();

        assertEquals("Nikola", zaSnimanje.getIme());
        assertEquals("nikola@gmail.com", zaSnimanje.getEmail());
        assertEquals("kodirano", zaSnimanje.getLozinka());
        assertEquals(Uloga.KORISNIK, zaSnimanje.getUloga());
        assertEquals(0, zaSnimanje.getBrojBodova());
        assertEquals(novaZvezda, zaSnimanje.getLoyaltyProgram());


        assertEquals(1L, result.getId());
        assertEquals(Uloga.KORISNIK, result.getUloga());
    }

    @Test
    void testCreateKodiraLozinku() {
        KorisnikDto dto = new KorisnikDto();
        dto.setIme("Nikola");
        dto.setEmail("nikola@gmail.com");
        dto.setLozinka("lozinka123");

        LoyaltyProgram novaZvezda = new LoyaltyProgram("Nova zvezda", 0.0, 0);
        Korisnik saved = new Korisnik("Nikola", "nikola@gmail.com", "kodirano", 0, Uloga.KORISNIK);
        saved.setLoyaltyProgram(novaZvezda);

        when(korisnikRepo.existsByEmail("nikola@gmail.com")).thenReturn(false);
        when(loyaltyRepo.findByNivo("Nova zvezda")).thenReturn(Optional.of(novaZvezda));
        when(passwordEncoder.encode("lozinka123")).thenReturn("kodirano");
        when(korisnikRepo.save(any(Korisnik.class))).thenReturn(saved);

        korisnikService.create(dto);

        verify(passwordEncoder).encode("lozinka123");
    }

    @Test
    void testCreateDupliEmailBacaIzuzetakINeCuva() {
        KorisnikDto dto = new KorisnikDto();
        dto.setEmail("test@gmail.com");

        when(korisnikRepo.existsByEmail("test@gmail.com")).thenReturn(true);

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> korisnikService.create(dto)
        );

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(korisnikRepo, never()).save(any());
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    void testCreateLoyaltyProgramNePostojiBaca500() {
        KorisnikDto dto = new KorisnikDto();
        dto.setIme("Nikola");
        dto.setEmail("nikola@gmail.com");
        dto.setLozinka("lozinka123");

        when(korisnikRepo.existsByEmail("nikola@gmail.com")).thenReturn(false);
        when(passwordEncoder.encode("lozinka123")).thenReturn("kodirano");
        when(loyaltyRepo.findByNivo("Nova zvezda")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> korisnikService.create(dto)
        );

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, ex.getStatusCode());
        verify(korisnikRepo, never()).save(any());
    }

    // SO: updateUserRole

    @Test
    void testUpdateUserRoleUspesno() {
        setupSecurityContext("admin@gmail.com");

        Korisnik admin = new Korisnik();
        admin.setId(1L);
        admin.setEmail("admin@gmail.com");
        admin.setUloga(Uloga.ADMIN);

        Korisnik meta = new Korisnik();
        meta.setId(2L);
        meta.setEmail("korisnik@gmail.com");
        meta.setUloga(Uloga.KORISNIK);

        when(korisnikRepo.findByEmail("admin@gmail.com")).thenReturn(Optional.of(admin));
        when(korisnikRepo.findById(2L)).thenReturn(Optional.of(meta));
        when(korisnikRepo.save(any(Korisnik.class))).thenAnswer(inv -> inv.getArgument(0));

        KorisnikViewDto result = korisnikService.updateUserRole(2L, Uloga.ZAPOSLENI);

        assertEquals(Uloga.ZAPOSLENI, result.getUloga());

        ArgumentCaptor<Korisnik> captor = ArgumentCaptor.forClass(Korisnik.class);
        verify(korisnikRepo).save(captor.capture());
        assertEquals(Uloga.ZAPOSLENI, captor.getValue().getUloga());
    }

    @Test
    void testUpdateUserRoleNullUlogaBaca400() {
        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> korisnikService.updateUserRole(1L, null)
        );

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(korisnikRepo, never()).save(any());
    }

    @Test
    void testUpdateUserRoleKorisnikNePostojiBaca404() {
        setupSecurityContext("admin@gmail.com");

        Korisnik admin = new Korisnik();
        admin.setId(1L);
        admin.setEmail("admin@gmail.com");
        admin.setUloga(Uloga.ADMIN);

        when(korisnikRepo.findByEmail("admin@gmail.com")).thenReturn(Optional.of(admin));
        when(korisnikRepo.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> korisnikService.updateUserRole(99L, Uloga.KORISNIK)
        );

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(korisnikRepo, never()).save(any());
    }

    @Test
    void testUpdateUserRoleAdminSkidaUloguBaca400() {
        setupSecurityContext("admin@gmail.com");

        Korisnik admin = new Korisnik();
        admin.setId(1L);
        admin.setEmail("admin@gmail.com");
        admin.setUloga(Uloga.ADMIN);

        when(korisnikRepo.findByEmail("admin@gmail.com")).thenReturn(Optional.of(admin));
        when(korisnikRepo.findById(1L)).thenReturn(Optional.of(admin));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> korisnikService.updateUserRole(1L, Uloga.KORISNIK)
        );

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(korisnikRepo, never()).save(any());
    }
}
