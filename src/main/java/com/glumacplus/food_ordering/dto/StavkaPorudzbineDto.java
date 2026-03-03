package com.glumacplus.food_ordering.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class StavkaPorudzbineDto {

    @NotNull(message = "Proizvod je obavezan")
    private Long proizvodId;

    @Positive(message = "Količina mora biti pozitivna")
    private double kolicina;


    public Long getProizvodId() { return proizvodId; }
    public void setProizvodId(Long proizvodId) { this.proizvodId = proizvodId; }
    public double getKolicina() { return kolicina; }
    public void setKolicina(double kolicina) { this.kolicina = kolicina; }
}
