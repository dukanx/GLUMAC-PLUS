package com.glumacplus.food_ordering.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class KorisnikMeUpdateDto {

    @NotBlank(message = "Ime je obavezno")
    private String ime;

    @Size(min = 8, message = "Lozinka mora imati najmanje 8 karaktera")
    private String novaLozinka;

    public String getIme() {
        return ime;
    }

    public void setIme(String ime) {
        this.ime = ime;
    }

    public String getNovaLozinka() {
        return novaLozinka;
    }

    public void setNovaLozinka(String novaLozinka) {
        this.novaLozinka = novaLozinka;
    }
}
