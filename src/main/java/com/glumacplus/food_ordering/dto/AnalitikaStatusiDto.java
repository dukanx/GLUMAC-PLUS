package com.glumacplus.food_ordering.dto;

public class AnalitikaStatusiDto {

    private long uPripremi;
    private long spremna;
    private long realizovana;
    private long otkazana;
    private long ukupno;

    public long getUPripremi() {
        return uPripremi;
    }

    public void setUPripremi(long uPripremi) {
        this.uPripremi = uPripremi;
    }

    public long getSpremna() {
        return spremna;
    }

    public void setSpremna(long spremna) {
        this.spremna = spremna;
    }

    public long getRealizovana() {
        return realizovana;
    }

    public void setRealizovana(long realizovana) {
        this.realizovana = realizovana;
    }

    public long getOtkazana() {
        return otkazana;
    }

    public void setOtkazana(long otkazana) {
        this.otkazana = otkazana;
    }

    public long getUkupno() {
        return ukupno;
    }

    public void setUkupno(long ukupno) {
        this.ukupno = ukupno;
    }
}
