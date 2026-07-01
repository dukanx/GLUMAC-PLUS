package com.glumacplus.food_ordering.model;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class NotifikacijaTest {

    Notifikacija n;

    @BeforeEach
    void setUp() {
        n = new Notifikacija();
    }

    @AfterEach
    void tearDown() {
        n = null;
    }

    @Test
    void testPodrazumevaniKonstruktor() {
        assertEquals(NotifikacijaTip.RUCNO, n.getTip());
        assertFalse(n.getProcitana());
    }

    @Test
    void testSetKorisnik() {
        Korisnik k = new Korisnik("Nikola", "nikola@gmail.com", "loz", 0, Uloga.KORISNIK);
        n.setKorisnik(k);
        assertEquals("Nikola", n.getKorisnik().getIme());
    }

    @Test
    void testSetKorisnikNullBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> n.setKorisnik(null));
    }

    @Test
    void testSetPoruka() {
        n.setPoruka("Vaša porudžbina je prihvaćena.");
        assertEquals("Vaša porudžbina je prihvaćena.", n.getPoruka());
    }

    @Test
    void testSetPorukaNullBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> n.setPoruka(null));
    }

    @Test
    void testSetPorukaPraznaBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> n.setPoruka("   "));
    }

    @Test
    void testSetTip() {
        n.setTip(NotifikacijaTip.PORUDZBINA_PRIHVACENA);
        assertEquals(NotifikacijaTip.PORUDZBINA_PRIHVACENA, n.getTip());
    }

    @Test
    void testSetTipNullBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> n.setTip(null));
    }

    @Test
    void testSetProcitana() {
        n.setProcitana(true);
        assertTrue(n.getProcitana());
    }

    @Test
    void testSetProcitanaNullBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> n.setProcitana(null));
    }

    @Test
    void testSetDatum() {
        LocalDateTime datum = LocalDateTime.of(2025, 6, 1, 12, 0);
        n.setDatum(datum);
        assertEquals(datum, n.getDatum());
    }

    @Test
    void testSetDatumNullBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> n.setDatum(null));
    }
}
