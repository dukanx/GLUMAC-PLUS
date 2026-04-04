package com.glumacplus.food_ordering.dto;

import com.glumacplus.food_ordering.model.OmiljenaPorudzbina;
import com.glumacplus.food_ordering.model.OmiljenaPorudzbinaStavka;

import java.util.stream.Collectors;

public class OmiljenaPorudzbinaMapper {

    public static OmiljenaPorudzbinaViewDto toViewDto(OmiljenaPorudzbina omiljenaPorudzbina) {
        OmiljenaPorudzbinaViewDto dto = new OmiljenaPorudzbinaViewDto();
        dto.setId(omiljenaPorudzbina.getId());
        dto.setNaziv(omiljenaPorudzbina.getNaziv());
        dto.setDatumKreiranja(omiljenaPorudzbina.getDatumKreiranja());
        dto.setStavke(
                omiljenaPorudzbina.getStavke().stream()
                        .map(OmiljenaPorudzbinaMapper::toViewDto)
                        .collect(Collectors.toList())
        );
        return dto;
    }

    public static OmiljenaPorudzbinaStavkaViewDto toViewDto(OmiljenaPorudzbinaStavka stavka) {
        OmiljenaPorudzbinaStavkaViewDto dto = new OmiljenaPorudzbinaStavkaViewDto();
        dto.setProizvodId(stavka.getProizvod().getId());
        dto.setNazivProizvoda(stavka.getProizvod().getNaziv());
        dto.setKolicina(stavka.getKolicina());
        return dto;
    }
}
