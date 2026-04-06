package com.glumacplus.food_ordering.dto;

import java.math.BigDecimal;

public class StavkaPorudzbineViewDto {

    private String nazivProizvoda;
    private double kolicina;
    private BigDecimal cena;
    private BigDecimal iznosStavke;



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

    public BigDecimal getCena() {
        return cena;
    }

    public void setCena(BigDecimal cena) {
        this.cena = cena;
    }

    public BigDecimal getIznosStavke() {
        return iznosStavke;
    }

    public void setIznosStavke(BigDecimal iznosStavke) {
        this.iznosStavke = iznosStavke;
    }
}
