package com.glumacplus.food_ordering.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AlergenDto {

    @NotBlank(message = "Naziv alergena je obavezan")
    @Size(max = 255, message = "Naziv alergena može imati najviše 255 karaktera")
    private String naziv;

    @Size(max = 1000, message = "Opis alergena može imati najviše 1000 karaktera")
    private String opis;

    public String getNaziv() {
        return naziv;
    }

    public void setNaziv(String naziv) {
        this.naziv = naziv;
    }

    public String getOpis() {
        return opis;
    }

    public void setOpis(String opis) {
        this.opis = opis;
    }
}
