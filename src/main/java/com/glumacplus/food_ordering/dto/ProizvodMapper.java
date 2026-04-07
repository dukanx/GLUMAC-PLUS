package com.glumacplus.food_ordering.dto;

import com.glumacplus.food_ordering.model.Proizvod;
import java.util.stream.Collectors;

public class ProizvodMapper {

    public static ProizvodViewDto toViewDto(Proizvod p) {
        ProizvodViewDto dto = new ProizvodViewDto();
        dto.setId(p.getId());
        dto.setNaziv(p.getNaziv());
        dto.setTip(p.getTip());
        dto.setCena(p.getCena());
        dto.setJedinicaMere(p.getJedinicaMere());
        dto.setKalorije(p.getKalorije());
        dto.setProteini(p.getProteini());
        dto.setMasti(p.getMasti());
        dto.setUgljeniHidrati(p.getUgljeniHidrati());
        dto.setAlergeniNazivi(
                p.getAlergeni().stream()
                        .map(alergen -> alergen.getNaziv())
                        .sorted()
                        .collect(Collectors.toList())
        );
        return dto;
    }

    public static Proizvod toEntity(ProizvodDto dto) {
        Proizvod p = new Proizvod();
        p.setNaziv(dto.getNaziv());
        p.setTip(dto.getTip());
        p.setCena(dto.getCena());
        p.setJedinicaMere(dto.getJedinicaMere());
        p.setKalorije(dto.getKalorije());
        p.setProteini(dto.getProteini());
        p.setMasti(dto.getMasti());
        p.setUgljeniHidrati(dto.getUgljeniHidrati());
        return p;
    }
}
