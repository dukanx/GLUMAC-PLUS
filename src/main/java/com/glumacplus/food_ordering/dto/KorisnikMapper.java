package com.glumacplus.food_ordering.dto;

import com.glumacplus.food_ordering.model.Korisnik;

public class KorisnikMapper {

    public static KorisnikViewDto toViewDto(Korisnik k) {
        return new KorisnikViewDto(
                k.getId(),
                k.getIme(),
                k.getEmail(),
                k.getBrojBodova(),
                (k.getLoyaltyProgram() != null) ? k.getLoyaltyProgram().getNivo() : "Nema",
                k.getUloga()
        );
    }
}
