package com.glumacplus.food_ordering.dto;

import com.glumacplus.food_ordering.model.DanUNedelji;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public class RadnoVremeDto {

    @NotNull(message = "Dan je obavezan")
    private DanUNedelji dan;

    @NotNull(message = "Početak radnog vremena je obavezan")
    private LocalTime odVremena;

    @NotNull(message = "Kraj radnog vremena je obavezan")
    private LocalTime doVremena;

    private Boolean aktivno;

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
