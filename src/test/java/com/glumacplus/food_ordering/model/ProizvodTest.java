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
    void testSetNazivNullBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> p.setNaziv(null));
    }

    @Test
    void testSetNazivPrazanBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> p.setNaziv("  "));
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
    void testSetCenaNullBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> p.setCena(null));
    }

    @Test
    void testSetCenaNulaBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> p.setCena(BigDecimal.ZERO));
    }

    @Test
    void testSetCenaNegativnaBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> p.setCena(new BigDecimal("-10.00")));
    }

    @Test
    void testSetJedinicaMere() {
        p.setJedinicaMere("kom");
        assertEquals("kom", p.getJedinicaMere());
    }

    @Test
    void testSetKalorijeNegativneBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> p.setKalorije(-1));
    }

    @Test
    void testSetProteiniNegativniBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> p.setProteini(-1));
    }

    @Test
    void testSetMastiNegativneBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> p.setMasti(-1));
    }

    @Test
    void testSetUgljeniHidratiNegativniBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> p.setUgljeniHidrati(-1));
    }

    @Test
    void testSetNutritivneNulaDozvoljena() {
        p.setKalorije(0);
        p.setProteini(0);
        assertEquals(0, p.getKalorije());
        assertEquals(0, p.getProteini());
    }

    @Test
    void testSetAlergeni() {
        Alergen a = new Alergen("Gluten", "opis");
        p.setAlergeni(Set.of(a));
        assertEquals(1, p.getAlergeni().size());
    }
}
