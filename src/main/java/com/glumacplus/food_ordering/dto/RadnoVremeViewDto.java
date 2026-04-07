package com.glumacplus.food_ordering.dto;

import com.glumacplus.food_ordering.model.DanUNedelji;

import java.time.LocalTime;

public class RadnoVremeViewDto {

    private Long id;
    private DanUNedelji dan;
    private LocalTime odVremena;
    private LocalTime doVremena;
    private Boolean aktivno;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public DanUNedelji getDan() {
        return dan;
    }

    public void setDan(DanUNedelji dan) {
        this.dan = dan;
    }

    public LocalTime getOdVremena() {
        return odVremena;
    }

    public void setOdVremena(LocalTime odVremena) {
        this.odVremena = odVremena;
    }

    public LocalTime getDoVremena() {
        return doVremena;
    }

    public void setDoVremena(LocalTime doVremena) {
        this.doVremena = doVremena;
    }

    public Boolean getAktivno() {
        return aktivno;
    }

    public void setAktivno(Boolean aktivno) {
        this.aktivno = aktivno;
    }
}
