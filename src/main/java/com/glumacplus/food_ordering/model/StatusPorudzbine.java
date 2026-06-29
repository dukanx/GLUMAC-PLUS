package com.glumacplus.food_ordering.model;

/**
 * Predstavlja status (stanje) porudžbine u njenom životnom ciklusu.
 *
 * <p>Dozvoljeni prelazi: {@code U_PRIPREMI} → {@code SPREMNA} ili
 * {@code OTKAZANA}; {@code SPREMNA} → {@code REALIZOVANA} ili
 * {@code OTKAZANA}. Stanja {@code REALIZOVANA} i {@code OTKAZANA} su
 * završna.</p>
 *
 * @author Nikola Dukić
 * @version 1.0
 */
public enum StatusPorudzbine {
    /** Porudžbina je primljena i u pripremi je. */
    U_PRIPREMI,
    /** Porudžbina je spremna za preuzimanje. */
    SPREMNA,
    /** Porudžbina je otkazana (završno stanje). */
    OTKAZANA,
    /** Porudžbina je realizovana i preuzeta (završno stanje). */
    REALIZOVANA
}
