package com.glumacplus.food_ordering.dto;

import com.glumacplus.food_ordering.model.StatusPorudzbine;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class PorudzbinaViewDto {

    private LocalDateTime datum;
    private List<StavkaPorudzbineViewDto> stavke=new ArrayList<>();
    private Long porudzbinaId;
    private StatusPorudzbine status;
    private double ukupanIznos;

    public double getUkupanIznos() {
        return ukupanIznos;
    }

    public void setUkupanIznos(double ukupanIznos) {
        this.ukupanIznos = ukupanIznos;
    }

    public LocalDateTime getDatum() {
        return datum;
    }

    public void setDatum(LocalDateTime datum) {
        this.datum = datum;
    }

    public List<StavkaPorudzbineViewDto> getStavke() {
        return stavke;
    }

    public void setStavke(List<StavkaPorudzbineViewDto> stavke) {
        this.stavke = stavke;
    }

    public Long getPorudzbinaId() {
        return porudzbinaId;
    }

    public void setPorudzbinaId(Long porudzbinaId) {
        this.porudzbinaId = porudzbinaId;
    }

    public StatusPorudzbine getStatus() {
        return status;
    }

    public void setStatus(StatusPorudzbine status) {
        this.status = status;
    }
}
