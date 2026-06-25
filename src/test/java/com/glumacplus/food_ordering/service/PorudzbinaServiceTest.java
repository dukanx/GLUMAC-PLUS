package com.glumacplus.food_ordering.service;

import com.glumacplus.food_ordering.dto.PorudzbinaDto;
import com.glumacplus.food_ordering.dto.PorudzbinaViewDto;
import com.glumacplus.food_ordering.dto.StavkaPorudzbineDto;
import com.glumacplus.food_ordering.model.*;
import com.glumacplus.food_ordering.repository.*;
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

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PorudzbinaServiceTest {

    @Mock PorudzbinaRepository porudzbinaRepo;
    @Mock ProizvodRepository proizvodRepo;
    @Mock KorisnikRepository korisnikRepo;
    @Mock LoyaltyProgramRepository loyaltyRepo;
    @Mock NotifikacijaService notifikacijaService;
    @Mock RadnoVremeRepository radnoVremeRepo;

    PorudzbinaService porudzbinaService;

    @BeforeEach
    void setUp() {
        porudzbinaService = new PorudzbinaService(
                porudzbinaRepo, proizvodRepo, korisnikRepo, loyaltyRepo,
                notifikacijaService, radnoVremeRepo,
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

    private Korisnik korisnik(Long id, String email) {
        Korisnik k = new Korisnik("Nikola", email, "hash", 0, Uloga.KORISNIK);
        k.setId(id);
        return k;
    }

    private void mockRestoranOtvoren() {
        when(radnoVremeRepo.findByAktivno(true)).thenReturn(List.of());
    }

    // SO: create

    @Test
    void testCreateUspesnoObracunavaIznos() {
        setupSecurityContext("korisnik@gmail.com");

        LoyaltyProgram nivo = new LoyaltyProgram("Glavna uloga", 10.0, 500);
        Korisnik k = korisnik(1L, "korisnik@gmail.com");
        k.setLoyaltyProgram(nivo);

        Proizvod p = new Proizvod();
        p.setId(1L);
        p.setNaziv("Nutela");
        p.setCena(new BigDecimal("500.00"));

        StavkaPorudzbineDto stavkaDto = new StavkaPorudzbineDto();
        stavkaDto.setProizvodId(1L);
        stavkaDto.setKolicina(2);

        PorudzbinaDto dto = new PorudzbinaDto();
        dto.setStavke(List.of(stavkaDto));

        when(korisnikRepo.findByEmail("korisnik@gmail.com")).thenReturn(Optional.of(k));
        mockRestoranOtvoren();
        when(porudzbinaRepo.existsByKorisnik_IdAndStatusIn(eq(1L), any())).thenReturn(false);
        when(proizvodRepo.findById(1L)).thenReturn(Optional.of(p));
        when(porudzbinaRepo.save(any(Porudzbina.class))).thenAnswer(inv -> inv.getArgument(0));

        PorudzbinaViewDto result = porudzbinaService.create(dto);


        assertEquals(new BigDecimal("900.00"), result.getUkupanIznos());
    }

    @Test
    void testCreateBezLoyaltyProgramaPunaCena() {
        setupSecurityContext("korisnik@gmail.com");


        Korisnik k = korisnik(1L, "korisnik@gmail.com");
        k.setLoyaltyProgram(null);

        Proizvod p = new Proizvod();
        p.setId(1L);
        p.setNaziv("Nutela");
        p.setCena(new BigDecimal("500.00"));

        StavkaPorudzbineDto stavkaDto = new StavkaPorudzbineDto();
        stavkaDto.setProizvodId(1L);
        stavkaDto.setKolicina(2);

        PorudzbinaDto dto = new PorudzbinaDto();
        dto.setStavke(List.of(stavkaDto));

        when(korisnikRepo.findByEmail("korisnik@gmail.com")).thenReturn(Optional.of(k));
        mockRestoranOtvoren();
        when(porudzbinaRepo.existsByKorisnik_IdAndStatusIn(eq(1L), any())).thenReturn(false);
        when(proizvodRepo.findById(1L)).thenReturn(Optional.of(p));
        when(porudzbinaRepo.save(any(Porudzbina.class))).thenAnswer(inv -> inv.getArgument(0));

        PorudzbinaViewDto result = porudzbinaService.create(dto);


        assertEquals(new BigDecimal("1000.00"), result.getUkupanIznos());
    }

    @Test
    void testCreateImaAktivnuBaca409() {
        setupSecurityContext("korisnik@gmail.com");

        Korisnik k = korisnik(1L, "korisnik@gmail.com");

        when(korisnikRepo.findByEmail("korisnik@gmail.com")).thenReturn(Optional.of(k));
        mockRestoranOtvoren();
        when(porudzbinaRepo.existsByKorisnik_IdAndStatusIn(eq(1L), any())).thenReturn(true);

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> porudzbinaService.create(new PorudzbinaDto())
        );
        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(porudzbinaRepo, never()).save(any());
    }

    @Test
    void testCreateVanRadnogVremenaBaca400() {
        // Clock je fiksiran na 2026-01-01T10:00 (cetvrtak)
        setupSecurityContext("korisnik@gmail.com");

        Korisnik k = korisnik(1L, "korisnik@gmail.com");

        RadnoVreme cetvrtak = new RadnoVreme();
        cetvrtak.setOdVremena(LocalTime.of(14, 0));
        cetvrtak.setDoVremena(LocalTime.of(22, 0));

        when(korisnikRepo.findByEmail("korisnik@gmail.com")).thenReturn(Optional.of(k));
        when(radnoVremeRepo.findByAktivno(true)).thenReturn(List.of(cetvrtak));
        when(radnoVremeRepo.findByDanAndAktivno(DanUNedelji.CETVRTAK, true)).thenReturn(List.of(cetvrtak));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> porudzbinaService.create(new PorudzbinaDto())
        );
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(porudzbinaRepo, never()).save(any());
    }

    @Test
    void testCreateProizvodNePostojiBaca404() {
        setupSecurityContext("korisnik@gmail.com");

        Korisnik k = korisnik(1L, "korisnik@gmail.com");

        StavkaPorudzbineDto stavkaDto = new StavkaPorudzbineDto();
        stavkaDto.setProizvodId(99L);
        stavkaDto.setKolicina(1);

        PorudzbinaDto dto = new PorudzbinaDto();
        dto.setStavke(List.of(stavkaDto));

        when(korisnikRepo.findByEmail("korisnik@gmail.com")).thenReturn(Optional.of(k));
        mockRestoranOtvoren();
        when(porudzbinaRepo.existsByKorisnik_IdAndStatusIn(eq(1L), any())).thenReturn(false);
        when(proizvodRepo.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> porudzbinaService.create(dto)
        );
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(porudzbinaRepo, never()).save(any());
    }

    // SO: changeStatus

    @Test
    void testChangeStatusURealizovanuDodeljujeBodove() {
        LoyaltyProgram novaZvezda = new LoyaltyProgram("Nova zvezda", 0.0, 0);
        novaZvezda.setId(1L);

        Korisnik k = new Korisnik("Nikola", "nik@gmail.com", "hash", 0, Uloga.KORISNIK);
        k.setId(1L);
        k.setBrojBodova(0);
        k.setLoyaltyProgram(novaZvezda);

        Porudzbina por = new Porudzbina();
        por.setId(1L);
        por.setStatus(StatusPorudzbine.SPREMNA);
        por.setUkupanIznos(new BigDecimal("500.00"));
        por.setKorisnik(k);

        when(porudzbinaRepo.findById(1L)).thenReturn(Optional.of(por));
        when(korisnikRepo.findById(1L)).thenReturn(Optional.of(k));
        when(loyaltyRepo.findAll()).thenReturn(List.of(novaZvezda));
        when(korisnikRepo.save(any(Korisnik.class))).thenAnswer(inv -> inv.getArgument(0));
        when(porudzbinaRepo.save(any(Porudzbina.class))).thenAnswer(inv -> inv.getArgument(0));

        porudzbinaService.changeStatus(1L, StatusPorudzbine.REALIZOVANA);

        //      500 / 100 = 5 bodova
        ArgumentCaptor<Korisnik> captor = ArgumentCaptor.forClass(Korisnik.class);
        verify(korisnikRepo).save(captor.capture());
        assertEquals(5, captor.getValue().getBrojBodova());
        verify(notifikacijaService).createForUser(eq(1L), eq(NotifikacijaTip.PORUDZBINA_ZAVRSENA), any());
    }

    @Test
    void testChangeStatusPrelazakNaVisiNivoSaljeNotifikaciju() {
        LoyaltyProgram novaZvezda = new LoyaltyProgram("Nova zvezda", 0.0, 0);
        novaZvezda.setId(1L);
        LoyaltyProgram epizodista = new LoyaltyProgram("Epizodista", 5.0, 100);
        epizodista.setId(2L);

        Korisnik k = new Korisnik("Nikola", "nik@gmail.com", "hash", 0, Uloga.KORISNIK);
        k.setId(1L);
        k.setBrojBodova(0);
        k.setLoyaltyProgram(novaZvezda);

        Porudzbina por = new Porudzbina();
        por.setId(1L);
        por.setStatus(StatusPorudzbine.SPREMNA);
        por.setUkupanIznos(new BigDecimal("10000.00"));
        por.setKorisnik(k);

        when(porudzbinaRepo.findById(1L)).thenReturn(Optional.of(por));
        when(korisnikRepo.findById(1L)).thenReturn(Optional.of(k));
        when(loyaltyRepo.findAll()).thenReturn(List.of(novaZvezda, epizodista));
        when(korisnikRepo.save(any(Korisnik.class))).thenAnswer(inv -> inv.getArgument(0));
        when(porudzbinaRepo.save(any(Porudzbina.class))).thenAnswer(inv -> inv.getArgument(0));

        porudzbinaService.changeStatus(1L, StatusPorudzbine.REALIZOVANA);

        // 10000 / 100 = 100 bodova -> iz "Nova zvezda" prelazi prag i postaje "Epizodista"
        ArgumentCaptor<Korisnik> captor = ArgumentCaptor.forClass(Korisnik.class);
        verify(korisnikRepo).save(captor.capture());
        assertEquals(100, captor.getValue().getBrojBodova());
        assertEquals("Epizodista", captor.getValue().getLoyaltyProgram().getNivo());
        verify(notifikacijaService).createForUser(
                eq(1L), eq(NotifikacijaTip.LOYALTY_LEVEL_UP), any());
    }

    @Test
    void testChangeStatusNevalidnaTranzicijaBaca400() {
        Porudzbina por = new Porudzbina();
        por.setId(1L);
        por.setStatus(StatusPorudzbine.U_PRIPREMI);

        when(porudzbinaRepo.findById(1L)).thenReturn(Optional.of(por));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> porudzbinaService.changeStatus(1L, StatusPorudzbine.REALIZOVANA)
        );
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(porudzbinaRepo, never()).save(any());
    }

    @Test
    void testChangeStatusIstiStatusNeMenja() {
        Porudzbina por = new Porudzbina();
        por.setId(1L);
        por.setStatus(StatusPorudzbine.U_PRIPREMI);

        when(porudzbinaRepo.findById(1L)).thenReturn(Optional.of(por));

        porudzbinaService.changeStatus(1L, StatusPorudzbine.U_PRIPREMI);

        verify(porudzbinaRepo, never()).save(any());
        verify(notifikacijaService, never()).createForUser(any(), any(), any());
    }

    @Test
    void testChangeStatusOtkazanaSaljeNotifikaciju() {
        Korisnik k = korisnik(1L, "korisnik@gmail.com");

        Porudzbina por = new Porudzbina();
        por.setId(3L);
        por.setStatus(StatusPorudzbine.U_PRIPREMI);
        por.setKorisnik(k);

        when(porudzbinaRepo.findById(3L)).thenReturn(Optional.of(por));
        when(porudzbinaRepo.save(any(Porudzbina.class))).thenAnswer(inv -> inv.getArgument(0));

        porudzbinaService.changeStatus(3L, StatusPorudzbine.OTKAZANA);

        verify(notifikacijaService).createForUser(
                eq(1L),
                eq(NotifikacijaTip.PORUDZBINA_OTKAZANA),
                eq("Vaša porudžbina #3 je otkazana.")
        );
    }

    @Test
    void testChangeStatusZavrsenaPorudzbinaBaca400() {
        Porudzbina por = new Porudzbina();
        por.setId(1L);
        por.setStatus(StatusPorudzbine.REALIZOVANA);

        when(porudzbinaRepo.findById(1L)).thenReturn(Optional.of(por));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> porudzbinaService.changeStatus(1L, StatusPorudzbine.OTKAZANA)
        );
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(porudzbinaRepo, never()).save(any());
    }

    // SO: cancelMyOrder

    @Test
    void testCancelMyOrderUspesno() {
        setupSecurityContext("korisnik@gmail.com");

        Korisnik k = korisnik(1L, "korisnik@gmail.com");

        Porudzbina por = new Porudzbina();
        por.setId(10L);
        por.setKorisnik(k);
        por.setStatus(StatusPorudzbine.U_PRIPREMI);

        when(korisnikRepo.findByEmail("korisnik@gmail.com")).thenReturn(Optional.of(k));
        when(porudzbinaRepo.findById(10L)).thenReturn(Optional.of(por));
        when(porudzbinaRepo.save(any(Porudzbina.class))).thenAnswer(inv -> inv.getArgument(0));

        porudzbinaService.cancelMyOrder(10L);

        ArgumentCaptor<Porudzbina> captor = ArgumentCaptor.forClass(Porudzbina.class);
        verify(porudzbinaRepo).save(captor.capture());
        assertEquals(StatusPorudzbine.OTKAZANA, captor.getValue().getStatus());
        verify(notifikacijaService).createForUser(
                eq(1L),
                eq(NotifikacijaTip.PORUDZBINA_OTKAZANA),
                eq("Vaša porudžbina #10 je otkazana.")
        );
    }

    @Test
    void testCancelMyOrderTudjaBaca403() {
        setupSecurityContext("korisnik@gmail.com");

        Korisnik korisnik = korisnik(1L, "korisnik@gmail.com");

        Korisnik vlasnik = new Korisnik();
        vlasnik.setId(2L);

        Porudzbina por = new Porudzbina();
        por.setId(10L);
        por.setKorisnik(vlasnik);
        por.setStatus(StatusPorudzbine.U_PRIPREMI);

        when(korisnikRepo.findByEmail("korisnik@gmail.com")).thenReturn(Optional.of(korisnik));
        when(porudzbinaRepo.findById(10L)).thenReturn(Optional.of(por));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> porudzbinaService.cancelMyOrder(10L)
        );
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(porudzbinaRepo, never()).save(any());
    }

    @Test
    void testCancelMyOrderNijeUPripremiBaca400() {
        setupSecurityContext("korisnik@gmail.com");

        Korisnik k = korisnik(1L, "korisnik@gmail.com");

        Porudzbina por = new Porudzbina();
        por.setId(10L);
        por.setKorisnik(k);
        por.setStatus(StatusPorudzbine.SPREMNA);

        when(korisnikRepo.findByEmail("korisnik@gmail.com")).thenReturn(Optional.of(k));
        when(porudzbinaRepo.findById(10L)).thenReturn(Optional.of(por));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> porudzbinaService.cancelMyOrder(10L)
        );
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(porudzbinaRepo, never()).save(any());
    }

    @Test
    void testCancelMyOrderNePostojiBaca404() {
        setupSecurityContext("korisnik@gmail.com");

        when(korisnikRepo.findByEmail("korisnik@gmail.com")).thenReturn(Optional.of(korisnik(1L, "korisnik@gmail.com")));
        when(porudzbinaRepo.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> porudzbinaService.cancelMyOrder(99L)
        );
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(porudzbinaRepo, never()).save(any());
    }
}
