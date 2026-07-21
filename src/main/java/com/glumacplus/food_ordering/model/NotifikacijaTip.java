package com.glumacplus.food_ordering.model;

/**
 * Predstavlja tip (vrstu) notifikacije koja se šalje korisniku.
 *
 * <p>Određuje povod zbog kog je notifikacija kreirana — najčešće promenu
 * stanja porudžbine ili napredak u loyalty programu.</p>
 *
 * @author Nikola Dukić
 * @version 1.0
 */
public enum NotifikacijaTip {
    /** Porudžbina je prihvaćena i u pripremi je. */
    PORUDZBINA_PRIHVACENA,
    /** Procenjeno vreme pripreme porudžbine je promenjeno. */
    PORUDZBINA_VREME_PROMENJENO,
    /** Porudžbina je otkazana. */
    PORUDZBINA_OTKAZANA,
    /** Porudžbina je spremna i čeka preuzimanje. */
    PORUDZBINA_SPREMNA,
    /** Porudžbina je preuzeta i realizovana. */
    PORUDZBINA_ZAVRSENA,
    /** Korisnik je prešao u viši loyalty nivo. */
    LOYALTY_LEVEL_UP,
    /** Ručno kreirana notifikacija (npr. od strane zaposlenog). */
    RUCNO
}
