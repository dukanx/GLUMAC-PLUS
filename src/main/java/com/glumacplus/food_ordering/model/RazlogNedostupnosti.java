package com.glumacplus.food_ordering.model;

/**
 * Razlog zbog kog je proizvod trenutno nedostupan u meniju ("86 lista").
 *
 * @author Nikola Dukić
 * @version 1.0
 */
public enum RazlogNedostupnosti {
    /** Nedostupan do kraja smene — vraća se automatski pri zatvaranju smene. */
    DO_KRAJA_SMENE,
    /** Nedostupan do daljnjeg — dok ga zaposleni ručno ne vrati. */
    DO_DALJNJEG
}
