package com.glumacplus.food_ordering.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class StavkaPorudzbineViewDto {

    private String nazivProizvoda;
    private double kolicina;
    private BigDecimal cena;
    private BigDecimal iznosStavke;
    /** Dodaci izabrani uz ovu stavku (prazno ako ih nema). */
    private List<StavkaDodatakViewDto> dodaci = new ArrayList<>();

    public List<StavkaDodatakViewDto> getDodaci() {
        return dodaci;
    }

    public void setDodaci(List<StavkaDodatakViewDto> dodaci) {
        this.dodaci = dodaci == null ? new ArrayList<>() : dodaci;
    }



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
