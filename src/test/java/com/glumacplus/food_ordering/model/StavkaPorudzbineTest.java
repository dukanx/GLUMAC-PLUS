package com.glumacplus.food_ordering.model;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class StavkaPorudzbineTest {

    StavkaPorudzbine s;

    @BeforeEach
    void setUp() {
        s = new StavkaPorudzbine();
    }

    @AfterEach
    void tearDown() {
        s = null;
    }

    @Test
    void testSetKolicinaIzracunaIznos() {
        s.setCena(new BigDecimal("300.00"));
        s.setKolicina(3);

        assertEquals(new BigDecimal("900.00"), s.getIznosStavke());
    }

    @Test
    void testSetKolicinaNulaBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> s.setKolicina(0));
    }

    @Test
    void testSetKolicinaNegativnaBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> s.setKolicina(-3));
    }

    @Test
    void testSetCenaIzracunaIznos() {
        s.setKolicina(2);
        s.setCena(new BigDecimal("590.00"));

        assertEquals(new BigDecimal("1180.00"), s.getIznosStavke());
    }

    @Test
    void testIznosStavkeSkaliraNaDveDecimale() {
        s.setCena(new BigDecimal("100.005"));
        s.setKolicina(3);

        assertEquals(new BigDecimal("300.03"), s.getIznosStavke());
    }

    @Test
    void testSetCenaNullBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> s.setCena(null));
    }

    @Test
    void testSetCenaNegativnaBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> s.setCena(new BigDecimal("-1.00")));
    }

    @Test
    void testSetCenaNulaBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> s.setCena(BigDecimal.ZERO));
    }

    @Test
    void testSetProizvod() {
        Proizvod p = new Proizvod();
        p.setNaziv("Palačinka");
        s.setProizvod(p);

        assertEquals("Palačinka", s.getProizvod().getNaziv());
    }

    @Test
    void testSetProizvodNullBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> s.setProizvod(null));
    }

    @Test
    void testSetPorudzbina() {
        Porudzbina por = new Porudzbina();
        s.setPorudzbina(por);

        assertNotNull(s.getPorudzbina());
    }

    @Test
    void testSetPorudzbinaNullBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> s.setPorudzbina(null));
    }
}
