package com.glumacplus.food_ordering.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;

public class ProizvodAlergeniUpdateDto {

    @NotNull(message = "Lista ID-jeva alergena je obavezna")
    private List<@NotNull(message = "ID alergena ne sme biti null") @Positive(message = "ID alergena mora biti pozitivan") Long> alergeniIds;

    public List<Long> getAlergeniIds() {
        return alergeniIds;
    }

    public void setAlergeniIds(List<Long> alergeniIds) {
        this.alergeniIds = alergeniIds;
    }
}
