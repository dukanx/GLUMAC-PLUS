package com.glumacplus.food_ordering.dto;

import com.glumacplus.food_ordering.model.Alergen;

public class AlergenMapper {

    public static AlergenViewDto toViewDto(Alergen alergen) {
        AlergenViewDto dto = new AlergenViewDto();
        dto.setId(alergen.getId());
        dto.setNaziv(alergen.getNaziv());
        dto.setOpis(alergen.getOpis());
        return dto;
    }

    public static Alergen toEntity(AlergenDto dto) {
        Alergen alergen = new Alergen();
        alergen.setNaziv(dto.getNaziv());
        alergen.setOpis(dto.getOpis());
        return alergen;
    }
}
