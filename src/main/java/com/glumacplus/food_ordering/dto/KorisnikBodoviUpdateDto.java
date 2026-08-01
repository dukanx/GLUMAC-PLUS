package com.glumacplus.food_ordering.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Ručna ispravka bodova iz admin panela.
 *
 * <p>Šalje se <em>promena</em>, ne novo stanje: dva admina koja istovremeno
 * dodaju po 50 bodova tako daju 100, dok bi slanje apsolutne vrednosti značilo
 * da drugi tiho pregazi prvog.</p>
 */
public class KorisnikBodoviUpdateDto {

    @NotNull(message = "Promena bodova je obavezna")
    private Integer promena;

    public Integer getPromena() {
        return promena;
    }

    public void setPromena(Integer promena) {
        this.promena = promena;
    }
}
