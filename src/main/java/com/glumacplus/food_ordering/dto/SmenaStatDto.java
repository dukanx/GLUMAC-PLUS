package com.glumacplus.food_ordering.dto;

import java.math.BigDecimal;

/**
 * Sažetak smene za panel zaposlenog: koliko proizvoda se vraća u ponudu
 * (skinuti "do kraja smene") i dnevna statistika realizovanih porudžbina.
 *
 * @param proizvodaZaVracanje broj proizvoda skinutih "do kraja smene"
 * @param brojPorudzbina broj realizovanih porudžbina danas
 * @param promet ukupan promet realizovanih porudžbina danas
 * @param prosecnaPriprema prosečno procenjeno vreme pripreme (minuti)
 */
public record SmenaStatDto(
        int proizvodaZaVracanje,
        long brojPorudzbina,
        BigDecimal promet,
        long prosecnaPriprema
) {}
