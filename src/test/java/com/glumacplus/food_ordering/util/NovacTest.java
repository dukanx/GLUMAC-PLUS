package com.glumacplus.food_ordering.util;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class NovacTest {

    @Test
    void testZaokruziHalfUp() {
        assertEquals(new BigDecimal("561"), Novac.zaokruzi(new BigDecimal("560.50")));
        assertEquals(new BigDecimal("560"), Novac.zaokruzi(new BigDecimal("560.49")));
        assertEquals(new BigDecimal("590"), Novac.zaokruzi(new BigDecimal("590")));
    }

    @Test
    void testZaokruziNull() {
        assertNull(Novac.zaokruzi(null));
    }

    @Test
    void testSaPopustomZaokruzujeFinalnuCenu() {
        // 590 * 0.95 = 560.50 -> 561 (ovo je iznos koji kupac plaća)
        assertEquals(new BigDecimal("561"), Novac.saPopustom(new BigDecimal("590"), 5));
    }

    @Test
    void testSaPopustomBezPopusta() {
        assertEquals(new BigDecimal("590"), Novac.saPopustom(new BigDecimal("590"), 0));
        assertEquals(new BigDecimal("590"), Novac.saPopustom(new BigDecimal("590"), -3));
    }

    /**
     * Suština pravila: popust se izvodi kao razlika, pa jednakost
     * {@code osnovica = zaPlacanje + popust} važi i kad zaokruživanje odseče
     * pola dinara. Da se popust računao zasebno ({@code round(590 * 0.05) = 30}),
     * zbir bi bio 591 umesto 590.
     */
    @Test
    void testOsnovicaJeUvekZbirIznosaIPopusta() {
        for (int osnovica = 100; osnovica <= 3000; osnovica += 10) {
            for (double procenat : new double[]{0, 3, 5, 7, 10, 15}) {
                BigDecimal osn = BigDecimal.valueOf(osnovica);
                BigDecimal zaPlacanje = Novac.saPopustom(osn, procenat);
                BigDecimal popust = Novac.zaokruzi(osn).subtract(zaPlacanje);

                assertEquals(0, Novac.zaokruzi(osn).compareTo(zaPlacanje.add(popust)),
                        "osnovica=" + osnovica + " popust=" + procenat);
                assertTrue(popust.scale() <= 0, "popust mora biti ceo dinar: " + popust);
            }
        }
    }

    @Test
    void testSveJeCeoDinar() {
        assertEquals(0, Novac.saPopustom(new BigDecimal("1670"), 5).scale());
        assertEquals(0, Novac.zaokruzi(new BigDecimal("1586.50")).scale());
    }
}
