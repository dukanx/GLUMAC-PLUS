package com.glumacplus.food_ordering.model;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class OmiljenaPorudzbinaStavkaTest {

    OmiljenaPorudzbinaStavka ops;

    @BeforeEach
    void setUp() {
        ops = new OmiljenaPorudzbinaStavka();
    }

    @AfterEach
    void tearDown() {
        ops = null;
    }

    @Test
    void testSetKolicina() {
        ops.setKolicina(3);
        assertEquals(3, ops.getKolicina());
    }

    @Test
    void testSetKolicinaNulaBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> ops.setKolicina(0));
    }

    @Test
    void testSetKolicinaNegativnaBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> ops.setKolicina(-2));
    }

    @Test
    void testSetProizvod() {
        Proizvod p = new Proizvod();
        p.setNaziv("Kafa");
        ops.setProizvod(p);
        assertEquals("Kafa", ops.getProizvod().getNaziv());
    }

    @Test
    void testSetProizvodNullBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> ops.setProizvod(null));
    }

    @Test
    void testSetOmiljenaPorudzbina() {
        OmiljenaPorudzbina op = new OmiljenaPorudzbina();
        op.setNaziv("Jutarnja");
        ops.setOmiljenaPorudzbina(op);
        assertEquals("Jutarnja", ops.getOmiljenaPorudzbina().getNaziv());
    }

    @Test
    void testSetOmiljenaPorudzbinaNullBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> ops.setOmiljenaPorudzbina(null));
    }
}
