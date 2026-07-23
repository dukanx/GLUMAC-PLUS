package com.glumacplus.food_ordering.dto;

import com.glumacplus.food_ordering.model.Porudzbina;
import com.glumacplus.food_ordering.model.StavkaPorudzbine;

import java.util.List;
import java.util.stream.Collectors;

public class PorudzbinaMapper {

    public static PorudzbinaViewDto toViewDto(Porudzbina p){
        PorudzbinaViewDto dto=new PorudzbinaViewDto();
        dto.setPorudzbinaId(p.getId());
        dto.setDatum(p.getDatum());
        dto.setStatus(p.getStatus());
        dto.setUkupanIznos(p.getUkupanIznos());
        dto.setOriginalnaCena(p.getOriginalnaCena());
        dto.setNapomena(p.getNapomena());
        dto.setTipPorudzbine(p.getTipPorudzbine());
        dto.setProcenjenoVreme(p.getProcenjenoVreme());
        List<StavkaPorudzbineViewDto> stavkeDto = p.getStavke().stream()
                .map(stavka -> toViewDto(stavka))
                .collect(Collectors.toList());

        dto.setStavke(stavkeDto);
        return dto;
    }

    public static StavkaPorudzbineViewDto toViewDto(StavkaPorudzbine s){
        StavkaPorudzbineViewDto dto=new StavkaPorudzbineViewDto();
        dto.setCena(s.getCena());
        dto.setKolicina(s.getKolicina());
        dto.setIznosStavke(s.getIznosStavke());
        dto.setNazivProizvoda(s.getProizvod().getNaziv());
        return dto;
    }

}
