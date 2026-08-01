package com.glumacplus.food_ordering.dto;

import jakarta.validation.constraints.NotNull;

/** Blokiranje i odblokiranje naloga iz admin panela. */
public class KorisnikBlokiranUpdateDto {

    @NotNull(message = "Vrednost blokiran je obavezna")
    private Boolean blokiran;

    public Boolean getBlokiran() {
        return blokiran;
    }

    public void setBlokiran(Boolean blokiran) {
        this.blokiran = blokiran;
    }
}
