package com.glumacplus.food_ordering.dto;

import com.glumacplus.food_ordering.model.NotifikacijaTip;

import java.time.LocalDateTime;

public class NotifikacijaViewDto {

    private Long id;
    private String poruka;
    private NotifikacijaTip tip;
    private Boolean procitana;
    private LocalDateTime datum;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPoruka() {
        return poruka;
    }

    public void setPoruka(String poruka) {
        this.poruka = poruka;
    }

    public NotifikacijaTip getTip() {
        return tip;
    }

    public void setTip(NotifikacijaTip tip) {
        this.tip = tip;
    }

    public Boolean getProcitana() {
        return procitana;
    }

    public void setProcitana(Boolean procitana) {
        this.procitana = procitana;
    }

    public LocalDateTime getDatum() {
        return datum;
    }

    public void setDatum(LocalDateTime datum) {
        this.datum = datum;
    }
}
