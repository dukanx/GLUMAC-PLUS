package com.glumacplus.food_ordering.model;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class PorudzbinaTest {

    Porudzbina por;

    @BeforeEach
    void setUp() {
        por = new Porudzbina();
    }

    @AfterEach
    void tearDown() {
        por = null;
    }

    @Test
    void testPodrazumevaniKonstruktor() {
        assertEquals(StatusPorudzbine.U_PRIPREMI, por.getStatus());
        assertEquals(TipPorudzbine.ZA_PONETI, por.getTipPorudzbine());
        assertEquals(new BigDecimal("0.00"), por.getUkupanIznos());
        assertEquals(new BigDecimal("0.00"), por.getOriginalnaCena());
        assertNotNull(por.getStavke());
        assertTrue(por.getStavke().isEmpty());
    }

    @Test
    void testSetUkupanIznosSkalira() {
        por.setUkupanIznos(new BigDecimal("560.555"));
        assertEquals(new BigDecimal("560.56"), por.getUkupanIznos());
    }

    @Test
    void testSetOriginalnaCenaSkalira() {
        por.setOriginalnaCena(new BigDecimal("590.999"));
        assertEquals(new BigDecimal("591.00"), por.getOriginalnaCena());
    }

    @Test
    void testSetStatus() {
        por.setStatus(StatusPorudzbine.SPREMNA);
        assertEquals(StatusPorudzbine.SPREMNA, por.getStatus());
    }

    @Test
    void testSetDatum() {
        LocalDateTime datum = LocalDateTime.of(2025, 5, 1, 12, 0);
        por.setDatum(datum);
        assertEquals(datum, por.getDatum());
    }

    @Test
    void testDodajStavkuPostavljaBidirekciju() {
        StavkaPorudzbine stavka = new StavkaPorudzbine();
        por.dodajStavku(stavka);

        assertTrue(por.getStavke().contains(stavka));
        assertEquals(por, stavka.getPorudzbina());
    }

    @Test
    void testGetKorisnikIdBezKorisnika() {
        assertNull(por.getKorisnikId());
    }

    @Test
    void testGetKorisnikIdSaKorisnikom() {
        Korisnik k = new Korisnik();
        k.setId(42L);
        por.setKorisnik(k);

        assertEquals(42L, por.getKorisnikId());
    }
}
