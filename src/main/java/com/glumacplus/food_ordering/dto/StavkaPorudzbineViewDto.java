package com.glumacplus.food_ordering.dto;

public class StavkaPorudzbineViewDto {

    private String nazivProizvoda;
    private double kolicina;
    private double cena;
    private double iznosStavke;



    public String getNazivProizvoda() {
        return nazivProizvoda;
    }

    public void setNazivProizvoda(String nazivProizvoda) {
        this.nazivProizvoda = nazivProizvoda;
    }

    public double getKolicina() {
        return kolicina;
    }

    public void setKolicina(double kolicina) {
        this.kolicina = kolicina;
    }

    public double getCena() {
        return cena;
    }

    public void setCena(double cena) {
        this.cena = cena;
    }

    public double getIznosStavke() {
        return iznosStavke;
    }

    public void setIznosStavke(double iznosStavke) {
        this.iznosStavke = iznosStavke;
    }
}
