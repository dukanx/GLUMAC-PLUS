package com.glumacplus.food_ordering.dto;

/**
 * Trenutno stanje smene za panel.
 *
 * @param pauzirano da li je primanje porudžbina ručno pauzirano
 * @param uRadnomVremenu da li je trenutno unutar radnog vremena
 * @param primaPorudzbine da li se porudžbine trenutno primaju (u radnom vremenu i nije pauzirano)
 */
public record SmenaStanjeDto(
        boolean pauzirano,
        boolean uRadnomVremenu,
        boolean primaPorudzbine
) {}
