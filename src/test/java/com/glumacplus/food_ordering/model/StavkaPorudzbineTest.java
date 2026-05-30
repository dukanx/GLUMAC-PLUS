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
    void testSetCenaIzracunaIznos() {
        s.setKolicina(2);
        s.setCena(new BigDecimal("590.00"));

        assertEquals(new BigDecimal("1180.00"), s.getIznosStavke());
    }

    @Test
    void testSetKolicinaIzracunaIznos() {
        s.setCena(new BigDecimal("300.00"));
        s.setKolicina(3);

        assertEquals(new BigDecimal("900.00"), s.getIznosStavke());
    }

    @Test
    void testIznosStavkeSkaliraNaDveDecimale() {
        s.setCena(new BigDecimal("100.005"));
        s.setKolicina(3);

        assertEquals(new BigDecimal("300.03"), s.getIznosStavke());
    }

    @Test
    void testCenaNullJednakoIznosNull() {
        s.setKolicina(2);
        s.setCena(null);

        assertNull(s.getIznosStavke());
    }

    @Test
    void testSetProizvod() {
        Proizvod p = new Proizvod();
        p.setNaziv("Palačinka");
        s.setProizvod(p);

        assertEquals("Palačinka", s.getProizvod().getNaziv());
    }

    @Test
    void testSetPorudzbina() {
        Porudzbina por = new Porudzbina();
        s.setPorudzbina(por);

        assertNotNull(s.getPorudzbina());
    }
}
