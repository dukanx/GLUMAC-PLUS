package com.glumacplus.food_ordering.dto;

public class AnalitikaTopProizvodDto {

    private Long proizvodId;
    private String nazivProizvoda;
    private double ukupnoKomada;
    private double ukupanPromet;

    public AnalitikaTopProizvodDto() {
    }

    public AnalitikaTopProizvodDto(Long proizvodId, String nazivProizvoda, double ukupnoKomada, double ukupanPromet) {
        this.proizvodId = proizvodId;
        this.nazivProizvoda = nazivProizvoda;
        this.ukupnoKomada = ukupnoKomada;
        this.ukupanPromet = ukupanPromet;
    }

    public Long getProizvodId() {
        return proizvodId;
    }

    public void setProizvodId(Long proizvodId) {
        this.proizvodId = proizvodId;
    }

    public String getNazivProizvoda() {
        return nazivProizvoda;
    }

    public void setNazivProizvoda(String nazivProizvoda) {
        this.nazivProizvoda = nazivProizvoda;
    }

    public double getUkupnoKomada() {
        return ukupnoKomada;
    }

    public void setUkupnoKomada(double ukupnoKomada) {
        this.ukupnoKomada = ukupnoKomada;
    }

    public double getUkupanPromet() {
        return ukupanPromet;
    }

    public void setUkupanPromet(double ukupanPromet) {
        this.ukupanPromet = ukupanPromet;
    }
}
