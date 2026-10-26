package com.glumacplus.food_ordering.model;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class AlergenTest {

    Alergen a;

    @BeforeEach
    void setUp() {
        a = new Alergen();
    }

    @AfterEach
    void tearDown() {
        a = null;
    }

    @Test
    void testKonstruktor() {
        Alergen novi = new Alergen("Gluten", "Prisutan u pšenici i ječmu");

        assertEquals("Gluten", novi.getNaziv());
        assertEquals("Prisutan u pšenici i ječmu", novi.getOpis());
    }

    @Test
    void testSetNaziv() {
        a.setNaziv("Laktoza");
        assertEquals("Laktoza", a.getNaziv());
    }

    @Test
    void testSetNazivNullBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> a.setNaziv(null));
    }

    @Test
    void testSetNazivPrazanBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> a.setNaziv("  "));
    }

    @Test
    void testSetOpis() {
        a.setOpis("Prisutna u mlečnim proizvodima");
        assertEquals("Prisutna u mlečnim proizvodima", a.getOpis());
    }

    @Test
    void testOpisMozeBitiNull() {
        a.setOpis(null);
        assertNull(a.getOpis());
    }

    @Test
    void testSetProizvodi() {
        Proizvod p = new Proizvod();
        p.setNaziv("Palačinka");

        a.setProizvodi(Set.of(p));

        assertEquals(1, a.getProizvodi().size());
    }
}
