package com.glumacplus.food_ordering.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Ulazni podatak o jednom dodatku izabranom uz stavku porudžbine.
 */
public class StavkaDodatakDto {

    @NotNull(message = "Dodatak je obavezan")
    private Long proizvodId;

    @Positive(message = "Količina mora biti pozitivna")
    private double kolicina = 1;

    public Long getProizvodId() { return proizvodId; }
    public void setProizvodId(Long proizvodId) { this.proizvodId = proizvodId; }
    public double getKolicina() { return kolicina; }
    public void setKolicina(double kolicina) { this.kolicina = kolicina; }
}
