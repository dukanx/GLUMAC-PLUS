package com.glumacplus.food_ordering.service;

import com.glumacplus.food_ordering.model.Proizvod;
import com.glumacplus.food_ordering.model.RazlogNedostupnosti;
import com.glumacplus.food_ordering.model.SmenaStanje;
import com.glumacplus.food_ordering.repository.PorudzbinaRepository;
import com.glumacplus.food_ordering.repository.ProizvodRepository;
import com.glumacplus.food_ordering.repository.SmenaStanjeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SmenaServiceTest {

    @Mock ProizvodRepository proizvodRepo;
    @Mock PorudzbinaRepository porudzbinaRepo;
    @Mock RadnoVremeService radnoVremeService;
    @Mock SmenaStanjeRepository smenaStanjeRepo;

    SmenaService smenaService;

    @BeforeEach
    void setUp() {
        smenaService = new SmenaService(proizvodRepo, porudzbinaRepo, radnoVremeService, smenaStanjeRepo,
                Clock.fixed(Instant.parse("2026-07-27T10:00:00Z"), ZoneId.of("UTC")));
    }

    private Proizvod skinut(String naziv) {
        Proizvod p = new Proizvod();
        p.setNaziv(naziv);
        p.setDostupan(false);
        p.setNedostupanRazlog(RazlogNedostupnosti.DO_KRAJA_SMENE);
        return p;
    }

    /**
     * Backend ugašen pre kraja radnog vremena, pa pokrenut sutradan usred smene:
     * trenutak zatvaranja se nikad nije desio dok je proces radio. Roba skinuta
     * "do kraja smene" mora da se vrati na početku nove smene, inače ostaje
     * skinuta zauvek.
     */
    @Test
    void testPrviTikUTokuRadnogVremenaVracaProizvodeSkinuteDoKrajaSmene() {
        Proizvod ananas = skinut("Ananas");

        when(radnoVremeService.jeOtvorenoSada()).thenReturn(true);
        when(proizvodRepo.findAllByNedostupanRazlog(RazlogNedostupnosti.DO_KRAJA_SMENE))
                .thenReturn(List.of(ananas));
        when(smenaStanjeRepo.findById(1L)).thenReturn(Optional.of(new SmenaStanje()));

        smenaService.automatskaSmena();

        assertTrue(ananas.isDostupan());
        assertNull(ananas.getNedostupanRazlog());
        verify(proizvodRepo).saveAll(anyList());
    }

    /** Kraj radnog vremena i dalje vraća robu (postojeće ponašanje). */
    @Test
    void testPrelazUZatvorenoVracaProizvode() {
        Proizvod ananas = skinut("Ananas");

        when(radnoVremeService.jeOtvorenoSada()).thenReturn(false);
        when(proizvodRepo.findAllByNedostupanRazlog(RazlogNedostupnosti.DO_KRAJA_SMENE))
                .thenReturn(List.of(ananas));

        smenaService.automatskaSmena();

        assertTrue(ananas.isDostupan());
        assertNull(ananas.getNedostupanRazlog());
    }

    /**
     * Dok smena traje (drugi i svaki naredni tik) ne sme se dirati roba — inače
     * bi se proizvod skinut u 11h sam vratio u 11:01.
     */
    @Test
    void testTikUTokuOtvoreneSmeneNeVracaProizvode() {
        when(radnoVremeService.jeOtvorenoSada()).thenReturn(true);
        when(proizvodRepo.findAllByNedostupanRazlog(RazlogNedostupnosti.DO_KRAJA_SMENE))
                .thenReturn(List.of());
        when(smenaStanjeRepo.findById(1L)).thenReturn(Optional.of(new SmenaStanje()));

        smenaService.automatskaSmena();   // prvi tik — nova smena
        clearInvocations(proizvodRepo);

        smenaService.automatskaSmena();   // drugi tik — smena već traje

        verify(proizvodRepo, never()).findAllByNedostupanRazlog(any());
        verify(proizvodRepo, never()).saveAll(anyList());
    }

    /** Pauza je samo zastavica — roba skinuta "do kraja smene" ostaje skinuta. */
    @Test
    void testPauzaNeVracaProizvode() {
        when(smenaStanjeRepo.findById(1L)).thenReturn(Optional.of(new SmenaStanje()));

        smenaService.setPauza(true);

        verify(proizvodRepo, never()).saveAll(anyList());
    }
}
