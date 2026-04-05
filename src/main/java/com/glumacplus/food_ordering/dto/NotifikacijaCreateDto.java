package com.glumacplus.food_ordering.dto;

import com.glumacplus.food_ordering.model.NotifikacijaTip;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class NotifikacijaCreateDto {

    @NotNull(message = "Korisnik ID je obavezan")
    private Long korisnikId;

    @NotBlank(message = "Poruka je obavezna")
    @Size(max = 1000, message = "Poruka može imati najviše 1000 karaktera")
    private String poruka;

    private NotifikacijaTip tip;

    public Long getKorisnikId() {
        return korisnikId;
    }

    public void setKorisnikId(Long korisnikId) {
        this.korisnikId = korisnikId;
    }

    public String getPoruka() {
        return poruka;
    }

    public void setPoruka(String poruka) {
        this.poruka = poruka;
    }

    public NotifikacijaTip getTip() {
        return tip;
    }

    public void setTip(NotifikacijaTip tip) {
        this.tip = tip;
    }
}
