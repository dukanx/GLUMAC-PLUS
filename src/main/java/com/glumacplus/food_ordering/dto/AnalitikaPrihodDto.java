package com.glumacplus.food_ordering.dto;

public class AnalitikaPrihodDto {

    private double ukupanPrihod;
    private long brojRealizovanihPorudzbina;

    public AnalitikaPrihodDto() {
    }

    public AnalitikaPrihodDto(double ukupanPrihod, long brojRealizovanihPorudzbina) {
        this.ukupanPrihod = ukupanPrihod;
        this.brojRealizovanihPorudzbina = brojRealizovanihPorudzbina;
    }

    public double getUkupanPrihod() {
        return ukupanPrihod;
    }

    public void setUkupanPrihod(double ukupanPrihod) {
        this.ukupanPrihod = ukupanPrihod;
    }

    public long getBrojRealizovanihPorudzbina() {
        return brojRealizovanihPorudzbina;
    }

    public void setBrojRealizovanihPorudzbina(long brojRealizovanihPorudzbina) {
        this.brojRealizovanihPorudzbina = brojRealizovanihPorudzbina;
    }
}
