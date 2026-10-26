package com.glumacplus.food_ordering.service;

import com.glumacplus.food_ordering.dto.AnalitikaPregledDto;
import com.glumacplus.food_ordering.model.StatusPorudzbine;
import com.glumacplus.food_ordering.repository.PorudzbinaRepository;
import com.glumacplus.food_ordering.repository.StavkaPorudzbineRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AnalitikaServiceTest {

    @Mock PorudzbinaRepository porudzbinaRepo;
    @Mock StavkaPorudzbineRepository stavkaRepo;

    AnalitikaService analitikaService;

    static final LocalDate OD = LocalDate.of(2026, 8, 1);
    static final LocalDate DO = LocalDate.of(2026, 8, 3);

    @BeforeEach
    void setUp() {
        analitikaService = new AnalitikaService(porudzbinaRepo, stavkaRepo);

        // Podrazumevano: prazna baza. Testovi koji nešto mere sami postave svoje.
        when(porudzbinaRepo.prihodZaPeriod(any(), any(), any())).thenReturn(null);
        when(porudzbinaRepo.brojPoStatusu(any(), any())).thenReturn(List.of());
        when(porudzbinaRepo.prihodPoDanima(any(), any(), any())).thenReturn(List.of());
        when(stavkaRepo.prometPoProizvodima(any(), any(), any())).thenReturn(List.of());
        when(stavkaRepo.prometPoDodacima(any(), any(), any())).thenReturn(List.of());
    }

    // ── granice perioda ──

    @Test
    void krajPeriodaJeUkljuciv() {
        analitikaService.pregled(OD, DO, 5);

        // Poslednji dan mora da uđe ceo: gornja granica je početak SLEDEĆEG dana.
        org.mockito.ArgumentCaptor<LocalDateTime> odC = org.mockito.ArgumentCaptor.forClass(LocalDateTime.class);
        org.mockito.ArgumentCaptor<LocalDateTime> doC = org.mockito.ArgumentCaptor.forClass(LocalDateTime.class);
        org.mockito.Mockito.verify(porudzbinaRepo)
                .prihodZaPeriod(eq(StatusPorudzbine.REALIZOVANA), odC.capture(), doC.capture());

        assertEquals(LocalDateTime.of(2026, 8, 1, 0, 0), odC.getValue());
        assertEquals(LocalDateTime.of(2026, 8, 4, 0, 0), doC.getValue());
    }

    @Test
    void pocetakPosleKrajaJeGreska() {
        ResponseStatusException e = assertThrows(ResponseStatusException.class,
                () -> analitikaService.pregled(DO, OD, 5));
        assertEquals(HttpStatus.BAD_REQUEST, e.getStatusCode());
    }

    @Test
    void nedostajuciDatumJeGreska() {
        assertThrows(ResponseStatusException.class, () -> analitikaService.pregled(null, DO, 5));
        assertThrows(ResponseStatusException.class, () -> analitikaService.pregled(OD, null, 5));
    }

    @Test
    void predugPeriodJeGreska() {
        ResponseStatusException e = assertThrows(ResponseStatusException.class,
                () -> analitikaService.pregled(OD, OD.plusYears(3), 5));
        assertEquals(HttpStatus.BAD_REQUEST, e.getStatusCode());
    }

    @Test
    void limitVanOpsegaJeGreska() {
        assertThrows(ResponseStatusException.class, () -> analitikaService.pregled(OD, DO, 0));
        assertThrows(ResponseStatusException.class, () -> analitikaService.pregled(OD, DO, 51));
    }

    // ── prazan period ──

    @Test
    void prazanPeriodDajeNuleANeNull() {
        AnalitikaPregledDto p = analitikaService.pregled(OD, DO, 5);

        assertEquals(BigDecimal.ZERO, p.prihod());
        assertEquals(0, p.brojPorudzbina());
        assertEquals(BigDecimal.ZERO, p.prosecnaKorpa());
        assertEquals(BigDecimal.ZERO, p.popust());
        assertTrue(p.topProizvodi().isEmpty());
        assertEquals(0, p.statusi().ukupno());
    }

    // ── promet ──

    @Test
    void prosecnaKorpaJePrihodPodeljenBrojem() {
        when(porudzbinaRepo.prihodZaPeriod(any(), any(), any()))
                .thenReturn(prihod(new BigDecimal("1000"), 3, new BigDecimal("120")));

        AnalitikaPregledDto p = analitikaService.pregled(OD, DO, 5);

        assertEquals(0, new BigDecimal("1000").compareTo(p.prihod()));
        assertEquals(3, p.brojPorudzbina());
        assertEquals(0, new BigDecimal("333").compareTo(p.prosecnaKorpa()));
        assertEquals(0, new BigDecimal("120").compareTo(p.popust()));
    }

    // ── statusi ──

    @Test
    void noveUlazeURaspodelu() {
        when(porudzbinaRepo.brojPoStatusu(any(), any())).thenReturn(List.of(
                new Object[]{StatusPorudzbine.NOVA, 2L},
                new Object[]{StatusPorudzbine.REALIZOVANA, 7L},
                new Object[]{StatusPorudzbine.OTKAZANA, 1L}
        ));

        AnalitikaPregledDto.Statusi s = analitikaService.pregled(OD, DO, 5).statusi();

        assertEquals(2, s.nova());
        assertEquals(7, s.realizovana());
        assertEquals(1, s.otkazana());
        assertEquals(0, s.uPripremi());
        assertEquals(10, s.ukupno(), "ukupno mora da obuhvati i NOVA");
    }

    // ── top proizvodi ──

    @Test
    void istiProizvodKaoStavkaIKaoDodatakJeJedanRed() {
        when(stavkaRepo.prometPoProizvodima(any(), any(), any()))
                .thenReturn(List.of(promet(4L, "Eurokrem", 3.0, new BigDecimal("300"))));
        when(stavkaRepo.prometPoDodacima(any(), any(), any()))
                .thenReturn(List.of(promet(4L, "Eurokrem", 5.0, new BigDecimal("500"))));

        List<AnalitikaPregledDto.TopProizvod> top = analitikaService.pregled(OD, DO, 5).topProizvodi();

        assertEquals(1, top.size(), "isti proizvod ne sme da se pojavi dvaput");
        assertEquals(8.0, top.getFirst().komada());
        assertEquals(0, new BigDecimal("800").compareTo(top.getFirst().promet()));
    }

    @Test
    void topProizvodiSuPoredjaniPoBrojuKomada() {
        when(stavkaRepo.prometPoProizvodima(any(), any(), any())).thenReturn(List.of(
                promet(1L, "Palačinka", 2.0, new BigDecimal("200")),
                promet(2L, "Kafa", 9.0, new BigDecimal("450")),
                promet(3L, "Sok", 5.0, new BigDecimal("250"))
        ));

        List<AnalitikaPregledDto.TopProizvod> top = analitikaService.pregled(OD, DO, 5).topProizvodi();

        assertEquals(List.of("Kafa", "Sok", "Palačinka"), top.stream().map(AnalitikaPregledDto.TopProizvod::naziv).toList());
    }

    @Test
    void limitSeceSpisak() {
        when(stavkaRepo.prometPoProizvodima(any(), any(), any())).thenReturn(List.of(
                promet(1L, "A", 9.0, new BigDecimal("90")),
                promet(2L, "B", 8.0, new BigDecimal("80")),
                promet(3L, "C", 7.0, new BigDecimal("70"))
        ));

        assertEquals(2, analitikaService.pregled(OD, DO, 2).topProizvodi().size());
    }

    // ── dani ──

    @Test
    void danBezPrometaUlaziKaoNula() {
        // Baza vraća samo 1. i 3. avgust; 2. mora da se pojavi kao prazan dan.
        when(porudzbinaRepo.prihodPoDanima(any(), any(), any())).thenReturn(List.of(
                new Object[]{2026, 8, 1, new BigDecimal("500"), 2L},
                new Object[]{2026, 8, 3, new BigDecimal("300"), 1L}
        ));

        List<AnalitikaPregledDto.Dan> dani = analitikaService.pregled(OD, DO, 5).poDanima();

        assertEquals(3, dani.size(), "svaki dan perioda mora da postoji");
        assertEquals(List.of(LocalDate.of(2026, 8, 1), LocalDate.of(2026, 8, 2), LocalDate.of(2026, 8, 3)),
                dani.stream().map(AnalitikaPregledDto.Dan::dan).toList());
        assertEquals(0, new BigDecimal("500").compareTo(dani.get(0).prihod()));
        assertEquals(BigDecimal.ZERO, dani.get(1).prihod());
        assertEquals(0, dani.get(1).brojPorudzbina());
    }

    @Test
    void jedanDanPeriodaJeJedanDanNaGrafikonu() {
        List<AnalitikaPregledDto.Dan> dani = analitikaService.pregled(OD, OD, 5).poDanima();
        assertEquals(1, dani.size());
        assertEquals(OD, dani.getFirst().dan());
    }

    // ── pomoćne ──

    private static PorudzbinaRepository.PrihodProjekcija prihod(BigDecimal prihod, long broj, BigDecimal popust) {
        return new PorudzbinaRepository.PrihodProjekcija() {
            @Override public BigDecimal getPrihod() { return prihod; }
            @Override public long getBroj() { return broj; }
            @Override public BigDecimal getPopust() { return popust; }
        };
    }

    private static StavkaPorudzbineRepository.PrometProjekcija promet(Long id, String naziv, Double komada, BigDecimal promet) {
        return new StavkaPorudzbineRepository.PrometProjekcija() {
            @Override public Long getProizvodId() { return id; }
            @Override public String getNaziv() { return naziv; }
            @Override public Double getKomada() { return komada; }
            @Override public BigDecimal getPromet() { return promet; }
        };
    }
}
