package com.glumacplus.food_ordering.model;

/**
 * Predstavlja status (stanje) porudžbine u njenom životnom ciklusu.
 *
 * <p>Dozvoljeni prelazi: {@code NOVA} → {@code U_PRIPREMI} ili
 * {@code OTKAZANA}; {@code U_PRIPREMI} → {@code SPREMNA} ili
 * {@code OTKAZANA}; {@code SPREMNA} → {@code REALIZOVANA} ili
 * {@code OTKAZANA}. Stanja {@code REALIZOVANA} i {@code OTKAZANA} su
 * završna.</p>
 *
 * @author Nikola Dukić
 * @version 1.0
 */
public enum StatusPorudzbine {
    /** Porudžbina je primljena i čeka da je zaposleni prihvati. */
    NOVA,
    /** Porudžbina je prihvaćena i u pripremi je. */
    U_PRIPREMI,
    /** Porudžbina je spremna i čeka da je kupac preuzme. */
    SPREMNA,
    /** Porudžbina je otkazana (završno stanje). */
    OTKAZANA,
    /** Porudžbina je preuzeta i realizovana (završno stanje). */
    REALIZOVANA
}
