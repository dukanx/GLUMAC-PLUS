package com.glumacplus.food_ordering.model;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class KorisnikTest {

    Korisnik k;

    @BeforeEach
    void setUp() {
        k = new Korisnik();
    }

    @AfterEach
    void tearDown() {
        k = null;
    }

    @Test
    void testKonstruktor() {
        Korisnik noviK = new Korisnik("Nikola Dukić", "nikola@gmail.com", "lozinka123", 150.0, Uloga.KORISNIK);

        assertEquals("Nikola Dukić", noviK.getIme());
        assertEquals("nikola@gmail.com", noviK.getEmail());
        assertEquals("lozinka123", noviK.getLozinka());
        assertEquals(150.0, noviK.getBrojBodova());
        assertEquals(Uloga.KORISNIK, noviK.getUloga());
    }

    @Test
    void testSetIme() {
        k.setIme("Nikola");
        assertEquals("Nikola", k.getIme());
    }

    @Test
    void testSetImeNullBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> k.setIme(null));
    }

    @Test
    void testSetImePraznoBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> k.setIme("   "));
    }

    @Test
    void testSetEmail() {
        k.setEmail("nikola@gmail.com");
        assertEquals("nikola@gmail.com", k.getEmail());
    }

    @Test
    void testSetEmailNullBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> k.setEmail(null));
    }

    @Test
    void testSetEmailPrazanBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> k.setEmail(""));
    }

    @Test
    void testSetLozinka() {
        k.setLozinka("lozinka123");
        assertEquals("lozinka123", k.getLozinka());
    }

    @Test
    void testSetLozinkaNullBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> k.setLozinka(null));
    }

    @Test
    void testSetBrojBodova() {
        k.setBrojBodova(350.0);
        assertEquals(350.0, k.getBrojBodova());
    }

    @Test
    void testSetBrojBodovaNegativanBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> k.setBrojBodova(-1));
    }

    @Test
    void testSetBrojBodovaNulaJeDozvoljena() {
        k.setBrojBodova(0);
        assertEquals(0, k.getBrojBodova());
    }

    @Test
    void testSetUloga() {
        k.setUloga(Uloga.ZAPOSLENI);
        assertEquals(Uloga.ZAPOSLENI, k.getUloga());
    }

    @Test
    void testSetUlogaNullBacaIzuzetak() {
        assertThrows(IllegalArgumentException.class, () -> k.setUloga(null));
    }

    @Test
    void testSetLoyaltyProgram() {
        LoyaltyProgram lp = new LoyaltyProgram();
        lp.setNivo("Zvezda");

        k.setLoyaltyProgram(lp);

        assertNotNull(k.getLoyaltyProgram());
        assertEquals("Zvezda", k.getLoyaltyProgram().getNivo());
    }

    @Test
    void testLoyaltyProgramMozeBitiNull() {
        k.setLoyaltyProgram(null);
        assertNull(k.getLoyaltyProgram());
    }

    @Test
    void testSetZadnjaUpotrebaPopusta() {
        LocalDateTime vreme = LocalDateTime.of(2025, 1, 15, 10, 30);
        k.setZadnjaUpotrebaPopusta(vreme);
        assertEquals(vreme, k.getZadnjaUpotrebaPopusta());
    }
}
