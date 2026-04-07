package com.glumacplus.food_ordering.dto;

import com.glumacplus.food_ordering.model.RadnoVreme;

public class RadnoVremeMapper {

    public static RadnoVremeViewDto toViewDto(RadnoVreme radnoVreme) {
        RadnoVremeViewDto dto = new RadnoVremeViewDto();
        dto.setId(radnoVreme.getId());
        dto.setDan(radnoVreme.getDan());
        dto.setOdVremena(radnoVreme.getOdVremena());
        dto.setDoVremena(radnoVreme.getDoVremena());
        dto.setAktivno(radnoVreme.getAktivno());
        return dto;
    }

    public static RadnoVreme toEntity(RadnoVremeDto dto) {
        RadnoVreme radnoVreme = new RadnoVreme();
        radnoVreme.setDan(dto.getDan());
        radnoVreme.setOdVremena(dto.getOdVremena());
        radnoVreme.setDoVremena(dto.getDoVremena());
        radnoVreme.setAktivno(dto.getAktivno() != null ? dto.getAktivno() : true);
        return radnoVreme;
    }
}
