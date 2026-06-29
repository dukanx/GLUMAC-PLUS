package com.glumacplus.food_ordering.model;

/**
 * Predstavlja ulogu korisnika u sistemu, koja određuje njegova prava pristupa.
 *
 * @author Nikola Dukić
 * @version 1.0
 */
public enum Uloga {
    /** Administrator sistema — pun pristup. */
    ADMIN,
    /** Registrovani korisnik koji naručuje hranu. */
    KORISNIK,
    /** Zaposleni koji obrađuje porudžbine. */
    ZAPOSLENI
}
