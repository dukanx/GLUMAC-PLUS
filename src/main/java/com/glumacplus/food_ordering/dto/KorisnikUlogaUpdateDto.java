package com.glumacplus.food_ordering.dto;

import com.glumacplus.food_ordering.model.Uloga;
import jakarta.validation.constraints.NotNull;

public class KorisnikUlogaUpdateDto {

    @NotNull(message = "Uloga je obavezna")
    private Uloga uloga;

    public Uloga getUloga() {
        return uloga;
    }

    public void setUloga(Uloga uloga) {
        this.uloga = uloga;
    }
}
