package com.glumacplus.food_ordering.model;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class OmiljenaPorudzbinaTest {

    OmiljenaPorudzbina op;

    @BeforeEach
    void setUp() {
        op = new OmiljenaPorudzbina();
    }

    @AfterEach
    void tearDown() {
        op = null;
    }

    @Test
    void testPodrazumevaniKonstruktor() {
        assertNotNull(op.getStavke());
        assertTrue(op.getStavke().isEmpty());
    }

    @Test
    void testSetNaziv() {
        op.setNaziv("Moja omljena");
        assertEquals("Moja omljena", op.getNaziv());
    }

    @Test
    void testSetNazivNullBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> op.setNaziv(null));
    }

    @Test
    void testSetNazivPrazanBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> op.setNaziv("  "));
    }

    @Test
    void testSetDatumKreiranja() {
        LocalDateTime datum = LocalDateTime.of(2025, 3, 10, 14, 0);
        op.setDatumKreiranja(datum);
        assertEquals(datum, op.getDatumKreiranja());
    }

    @Test
    void testSetDatumKreiranjaNullBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> op.setDatumKreiranja(null));
    }

    @Test
    void testSetKorisnik() {
        Korisnik k = new Korisnik("Nikola", "nikola@gmail.com", "loz", 0, Uloga.KORISNIK);
        op.setKorisnik(k);
        assertEquals("Nikola", op.getKorisnik().getIme());
    }

    @Test
    void testSetKorisnikNullBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> op.setKorisnik(null));
    }

    @Test
    void testDodajStavkuPostavljaBidirekciju() {
        OmiljenaPorudzbinaStavka stavka = new OmiljenaPorudzbinaStavka();
        op.dodajStavku(stavka);

        assertTrue(op.getStavke().contains(stavka));
        assertEquals(op, stavka.getOmiljenaPorudzbina());
    }

    @Test
    void testGetKorisnikIdBezKorisnika() {
        assertNull(op.getKorisnikId());
    }
}
