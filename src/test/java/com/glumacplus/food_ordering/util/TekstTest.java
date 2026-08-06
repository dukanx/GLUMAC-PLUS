package com.glumacplus.food_ordering.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Normalizacija mora da daje isto što i frontendov `utils/tekst.ts` — inače bi
 * ista reč davala različite rezultate u meniju i u admin panelu.
 */
class TekstTest {

    @Test
    void kvaciceSeZanemaruju() {
        assertEquals("sunka", Tekst.normalizuj("Šunka"));
        assertEquals("cevapi", Tekst.normalizuj("Ćevapi"));
        assertEquals("zzz", Tekst.normalizuj("Žžž"));
    }

    @Test
    void djIdeUDjNeUD() {
        // NFD ne razlaže đ (U+0111), pa ide ručno. „dj" jer tako i kucamo bez kvačica.
        assertEquals("djubre", Tekst.normalizuj("Đubre"));
        assertEquals("djordje", Tekst.normalizuj("Đorđe"));
    }

    @Test
    void cirilicaSeSvodiNaIstoStoILatinica() {
        assertEquals(Tekst.normalizuj("šunka"), Tekst.normalizuj("шунка"));
        assertEquals(Tekst.normalizuj("djordje"), Tekst.normalizuj("ђорђе"));
        assertEquals(Tekst.normalizuj("njuska"), Tekst.normalizuj("њушка"));
    }

    @Test
    void sadrziRadiUObaSmera() {
        assertTrue(Tekst.sadrzi("Palačinka Šunka", "sunka"));
        assertTrue(Tekst.sadrzi("Palacinka Sunka", "šunka"));
        assertTrue(Tekst.sadrzi("Palačinka Šunka", "шунка"));
    }

    @Test
    void prazanPojamSadrziSve() {
        assertTrue(Tekst.sadrzi("bilo šta", ""));
        assertTrue(Tekst.sadrzi("bilo šta", "   "));
    }

    @Test
    void nullSeNeRusi() {
        assertEquals("", Tekst.normalizuj(null));
        assertTrue(Tekst.sadrzi(null, ""));
        assertFalse(Tekst.sadrzi(null, "nesto"));
    }
}
