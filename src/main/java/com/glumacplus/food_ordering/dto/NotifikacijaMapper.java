package com.glumacplus.food_ordering.dto;

import com.glumacplus.food_ordering.model.Notifikacija;

public class NotifikacijaMapper {

    public static NotifikacijaViewDto toViewDto(Notifikacija notifikacija) {
        NotifikacijaViewDto dto = new NotifikacijaViewDto();
        dto.setId(notifikacija.getId());
        dto.setPoruka(notifikacija.getPoruka());
        dto.setTip(notifikacija.getTip());
        dto.setProcitana(notifikacija.getProcitana());
        dto.setDatum(notifikacija.getDatum());
        return dto;
    }
}
