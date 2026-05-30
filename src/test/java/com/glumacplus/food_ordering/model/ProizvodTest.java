package com.glumacplus.food_ordering.model;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class ProizvodTest {

    Proizvod p;

    @BeforeEach
    void setUp() {
        p = new Proizvod();
    }

    @AfterEach
    void tearDown() {
        p = null;
    }

    @Test
    void testKonstruktor() {
        Proizvod novi = new Proizvod("Palačinka", "palacinka",
                new BigDecimal("590.00"), "kom", 420, 8.5, 12.0, 65.0);

        assertEquals("Palačinka", novi.getNaziv());
        assertEquals("palacinka", novi.getTip());
        assertEquals(new BigDecimal("590.00"), novi.getCena());
        assertEquals("kom", novi.getJedinicaMere());
        assertEquals(420, novi.getKalorije());
        assertEquals(8.5, novi.getProteini());
        assertEquals(12.0, novi.getMasti());
        assertEquals(65.0, novi.getUgljeniHidrati());
    }

    @Test
    void testPodrazumevaniKonstruktor() {
        assertNull(p.getNaziv());
        assertNull(p.getCena());
        assertNotNull(p.getAlergeni());
    }

    @Test
    void testSetNaziv() {
        p.setNaziv("Dubai palačinka");
        assertEquals("Dubai palačinka", p.getNaziv());
    }

    @Test
    void testSetTip() {
        p.setTip("palacinka");
        assertEquals("palacinka", p.getTip());
    }

    @Test
    void testSetCenaSkaliraNaDveDecimale() {
        p.setCena(new BigDecimal("590.999"));
        assertEquals(new BigDecimal("591.00"), p.getCena());
    }

    @Test
    void testSetCenaMozeBitiNull() {
        p.setCena(null);
        assertNull(p.getCena());
    }

    @Test
    void testSetJedinicaMere() {
        p.setJedinicaMere("kom");
        assertEquals("kom", p.getJedinicaMere());
    }

    @Test
    void testSetAlergeni() {
        Alergen a = new Alergen("Gluten", "opis");
        p.setAlergeni(Set.of(a));
        assertEquals(1, p.getAlergeni().size());
    }
}
