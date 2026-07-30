package com.glumacplus.food_ordering.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Jedno mesto za pravila zaokruživanja novca.
 *
 * <p>RSD nema podjedinicu — pola dinara se ne može naplatiti, pa svaki iznos
 * koji ide na račun mora biti ceo broj. Pravilo je identično na frontendu
 * ({@code utils/korpa.ts}), da prikaz u korpi i iznos na računu uvek budu isti.</p>
 *
 * <p><b>Popust se nikad ne računa direktno</b>, nego kao razlika
 * ({@code originalnaCena - ukupanIznos}). Time jednakost
 * {@code originalnaCena = ukupanIznos + popust} važi uvek, jer
 * {@code round(a - b) != a - round(b)}.</p>
 */
public final class Novac {

    private Novac() {}

    /**
     * Zaokružuje iznos na ceo dinar (HALF_UP: 560.50 → 561).
     *
     * @param iznos iznos za zaokruživanje; {@code null} vraća {@code null}
     * @return iznos zaokružen na ceo dinar
     */
    public static BigDecimal zaokruzi(BigDecimal iznos) {
        return iznos == null ? null : iznos.setScale(0, RoundingMode.HALF_UP);
    }

    /**
     * Primenjuje popust na osnovicu i zaokružuje rezultat na ceo dinar.
     *
     * @param osnovica cena pre popusta
     * @param popustProcenat popust u procentima (0 znači bez popusta)
     * @return iznos za plaćanje, zaokružen na ceo dinar
     */
    public static BigDecimal saPopustom(BigDecimal osnovica, double popustProcenat) {
        if (osnovica == null) {
            return null;
        }
        if (popustProcenat <= 0) {
            return zaokruzi(osnovica);
        }
        BigDecimal faktor = BigDecimal.valueOf(100.0 - popustProcenat)
                .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        return zaokruzi(osnovica.multiply(faktor));
    }
}
