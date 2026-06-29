package com.glumacplus.food_ordering.service;

import com.glumacplus.food_ordering.dto.OmiljenaPorudzbinaViewDto;
import com.glumacplus.food_ordering.model.*;
import com.glumacplus.food_ordering.repository.KorisnikRepository;
import com.glumacplus.food_ordering.repository.OmiljenaPorudzbinaRepository;
import com.glumacplus.food_ordering.repository.PorudzbinaRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OmiljenaPorudzbinaServiceTest {

    @Mock OmiljenaPorudzbinaRepository omiljenaPorudzbinaRepo;
    @Mock PorudzbinaRepository porudzbinaRepo;
    @Mock PorudzbinaService porudzbinaService;
    @Mock KorisnikRepository korisnikRepo;

    OmiljenaPorudzbinaService omiljenaPorudzbinaService;

    @BeforeEach
    void setUp() {
        omiljenaPorudzbinaService = new OmiljenaPorudzbinaService(
                omiljenaPorudzbinaRepo, porudzbinaRepo, porudzbinaService, korisnikRepo,
                Clock.fixed(Instant.parse("2026-01-01T10:00:00Z"), ZoneId.of("UTC"))
        );
    }

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

    @Test
    void testCreateFromOrderTudjaBaca403() {
        setupSecurityContext("korisnik@gmail.com");

        Korisnik korisnik = new Korisnik("Nikola", "korisnik@gmail.com", "hash", 0, Uloga.KORISNIK);
        korisnik.setId(1L);

        Korisnik vlasnik = new Korisnik();
        vlasnik.setId(2L);

        Porudzbina por = new Porudzbina();
        por.setId(5L);
        por.setKorisnik(vlasnik);

        when(korisnikRepo.findByEmail("korisnik@gmail.com")).thenReturn(Optional.of(korisnik));
        when(porudzbinaRepo.findById(5L)).thenReturn(Optional.of(por));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> omiljenaPorudzbinaService.createFromOrder(5L, "Test")
        );
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void testCreateFromOrderUspesnoKreiranje() {
        setupSecurityContext("korisnik@gmail.com");

        Korisnik korisnik = new Korisnik("Nikola", "korisnik@gmail.com", "hash", 0, Uloga.KORISNIK);
        korisnik.setId(1L);

        Proizvod p = new Proizvod();
        p.setId(1L);
        p.setNaziv("Nutela");

        StavkaPorudzbine stavka = new StavkaPorudzbine();
        stavka.setProizvod(p);
        stavka.setKolicina(2);

        Porudzbina por = new Porudzbina();
        por.setId(5L);
        por.setKorisnik(korisnik);
        por.dodajStavku(stavka);

        when(korisnikRepo.findByEmail("korisnik@gmail.com")).thenReturn(Optional.of(korisnik));
        when(porudzbinaRepo.findById(5L)).thenReturn(Optional.of(por));
        when(omiljenaPorudzbinaRepo.save(any(OmiljenaPorudzbina.class))).thenAnswer(inv -> inv.getArgument(0));

        OmiljenaPorudzbinaViewDto result = omiljenaPorudzbinaService.createFromOrder(5L, "Moja omiljena");

        assertEquals("Moja omiljena", result.getNaziv());


        ArgumentCaptor<OmiljenaPorudzbina> captor = ArgumentCaptor.forClass(OmiljenaPorudzbina.class);
        verify(omiljenaPorudzbinaRepo).save(captor.capture());
        OmiljenaPorudzbina zaSnimanje = captor.getValue();

        assertEquals(1, zaSnimanje.getStavke().size());
        assertEquals("Nutela", zaSnimanje.getStavke().getFirst().getProizvod().getNaziv());
        assertEquals(2, zaSnimanje.getStavke().getFirst().getKolicina());
    }

    @Test
    void testCreateFromOrderBezNazivaKoristiPodrazumevani() {
        setupSecurityContext("korisnik@gmail.com");

        Korisnik korisnik = new Korisnik("Nikola", "korisnik@gmail.com", "hash", 0, Uloga.KORISNIK);
        korisnik.setId(1L);

        Proizvod p = new Proizvod();
        p.setId(1L);
        p.setNaziv("Nutela");

        StavkaPorudzbine stavka = new StavkaPorudzbine();
        stavka.setProizvod(p);
        stavka.setKolicina(2);

        Porudzbina por = new Porudzbina();
        por.setId(5L);
        por.setKorisnik(korisnik);
        por.dodajStavku(stavka);

        when(korisnikRepo.findByEmail("korisnik@gmail.com")).thenReturn(Optional.of(korisnik));
        when(porudzbinaRepo.findById(5L)).thenReturn(Optional.of(por));
        when(omiljenaPorudzbinaRepo.save(any(OmiljenaPorudzbina.class))).thenAnswer(inv -> inv.getArgument(0));


        OmiljenaPorudzbinaViewDto result = omiljenaPorudzbinaService.createFromOrder(5L, null);

        assertEquals("Omiljena porudžbina #5", result.getNaziv());
    }

    @Test
    void testCreateFromOrderPorudzbinaNePostojiBaca404() {
        setupSecurityContext("korisnik@gmail.com");

        Korisnik korisnik = new Korisnik("Nikola", "korisnik@gmail.com", "hash", 0, Uloga.KORISNIK);
        korisnik.setId(1L);

        when(korisnikRepo.findByEmail("korisnik@gmail.com")).thenReturn(Optional.of(korisnik));
        when(porudzbinaRepo.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> omiljenaPorudzbinaService.createFromOrder(99L, "Test")
        );
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(omiljenaPorudzbinaRepo, never()).save(any());
    }

    @Test
    void testCreateFromOrderPrazneStavkeBaca400() {
        setupSecurityContext("korisnik@gmail.com");

        Korisnik korisnik = new Korisnik("Nikola", "korisnik@gmail.com", "hash", 0, Uloga.KORISNIK);
        korisnik.setId(1L);


        Porudzbina por = new Porudzbina();
        por.setId(5L);
        por.setKorisnik(korisnik);

        when(korisnikRepo.findByEmail("korisnik@gmail.com")).thenReturn(Optional.of(korisnik));
        when(porudzbinaRepo.findById(5L)).thenReturn(Optional.of(por));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> omiljenaPorudzbinaService.createFromOrder(5L, "Test")
        );
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(omiljenaPorudzbinaRepo, never()).save(any());
    }
}
