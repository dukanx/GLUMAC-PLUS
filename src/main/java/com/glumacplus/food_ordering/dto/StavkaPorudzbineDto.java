package com.glumacplus.food_ordering.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.ArrayList;
import java.util.List;

public class StavkaPorudzbineDto {

    @NotNull(message = "Proizvod je obavezan")
    private Long proizvodId;

    @Positive(message = "Količina mora biti pozitivna")
    private double kolicina;

    /** Opcioni dodaci uz ovu stavku (prazno ako ih nema). */
    @Valid
    private List<StavkaDodatakDto> dodaci = new ArrayList<>();


    public Long getProizvodId() { return proizvodId; }
    public void setProizvodId(Long proizvodId) { this.proizvodId = proizvodId; }
    public double getKolicina() { return kolicina; }
    public void setKolicina(double kolicina) { this.kolicina = kolicina; }
    public List<StavkaDodatakDto> getDodaci() { return dodaci; }
    public void setDodaci(List<StavkaDodatakDto> dodaci) { this.dodaci = dodaci == null ? new ArrayList<>() : dodaci; }
}
