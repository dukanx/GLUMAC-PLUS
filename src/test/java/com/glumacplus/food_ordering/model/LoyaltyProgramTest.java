package com.glumacplus.food_ordering.model;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class LoyaltyProgramTest {

    LoyaltyProgram lp;

    @BeforeEach
    void setUp() {
        lp = new LoyaltyProgram();
    }

    @AfterEach
    void tearDown() {
        lp = null;
    }

    @Test
    void testKonstruktor() {
        LoyaltyProgram novi = new LoyaltyProgram("Zlatna zvezda", 10.0, 500);

        assertEquals("Zlatna zvezda", novi.getNivo());
        assertEquals(10.0, novi.getPopust());
        assertEquals(500, novi.getPragBodova());
    }

    @Test
    void testPodrazumevaniKonstruktor() {
        assertNull(lp.getNivo());
        assertEquals(0.0, lp.getPopust());
        assertEquals(0, lp.getPragBodova());
    }

    @Test
    void testSetNivo() {
        lp.setNivo("Dijamantska zvezda");
        assertEquals("Dijamantska zvezda", lp.getNivo());
    }

    @Test
    void testSetPopust() {
        lp.setPopust(15.0);
        assertEquals(15.0, lp.getPopust());
    }

    @Test
    void testSetPragBodova() {
        lp.setPragBodova(1000);
        assertEquals(1000, lp.getPragBodova());
    }

    @Test
    void testSetKorisnici() {
        Korisnik k1 = new Korisnik("Nikola", "nikola@gmail.com", "loz", 0, Uloga.KORISNIK);
        Korisnik k2 = new Korisnik("Ana", "ana@gmail.com", "loz", 0, Uloga.KORISNIK);

        lp.setKorisnici(List.of(k1, k2));

        assertEquals(2, lp.getKorisnici().size());
    }

    @Test
    void testKorisniciMozeBitiNull() {
        lp.setKorisnici(null);
        assertNull(lp.getKorisnici());
    }
}
