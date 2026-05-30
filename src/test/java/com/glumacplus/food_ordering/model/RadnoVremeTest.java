package com.glumacplus.food_ordering.model;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

class RadnoVremeTest {

    RadnoVreme rv;

    @BeforeEach
    void setUp() {
        rv = new RadnoVreme();
    }

    @AfterEach
    void tearDown() {
        rv = null;
    }

    @Test
    void testKonstruktor() {
        RadnoVreme novi = new RadnoVreme(
                DanUNedelji.PONEDELJAK,
                LocalTime.of(8, 0),
                LocalTime.of(20, 0),
                true
        );

        assertEquals(DanUNedelji.PONEDELJAK, novi.getDan());
        assertEquals(LocalTime.of(8, 0), novi.getOdVremena());
        assertEquals(LocalTime.of(20, 0), novi.getDoVremena());
        assertTrue(novi.getAktivno());
    }

    @Test
    void testPodrazumevaniKonstruktorAktivnoTrue() {
        assertTrue(rv.getAktivno());
    }

    @Test
    void testSetDan() {
        rv.setDan(DanUNedelji.PETAK);
        assertEquals(DanUNedelji.PETAK, rv.getDan());
    }

    @Test
    void testSetOdVremena() {
        rv.setOdVremena(LocalTime.of(9, 0));
        assertEquals(LocalTime.of(9, 0), rv.getOdVremena());
    }

    @Test
    void testSetDoVremena() {
        rv.setDoVremena(LocalTime.of(22, 0));
        assertEquals(LocalTime.of(22, 0), rv.getDoVremena());
    }

    @Test
    void testSetAktivno() {
        rv.setAktivno(false);
        assertFalse(rv.getAktivno());
    }
}
