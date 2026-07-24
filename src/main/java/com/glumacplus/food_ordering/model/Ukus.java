package com.glumacplus.food_ordering.model;

/**
 * Ukus proizvoda — koristi se za poklapanje dodataka sa palačinkama
 * (slatki dodaci idu uz slatke palačinke, slani uz slane). Proizvodi kojima
 * ukus nije primenljiv (piće, žestoko) imaju {@code null}.
 *
 * @author Nikola Dukić
 * @version 1.0
 */
public enum Ukus {
    SLATKO,
    SLANO
}
