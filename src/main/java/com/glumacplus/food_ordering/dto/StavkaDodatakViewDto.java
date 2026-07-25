package com.glumacplus.food_ordering.dto;

import java.math.BigDecimal;

/**
 * Prikaz jednog dodatka na stavci porudžbine (naziv, količina i cena
 * zapamćena u trenutku porudžbine).
 */
public class StavkaDodatakViewDto {

    private String nazivProizvoda;
    private double kolicina;
    private BigDecimal cena;

    public String getNazivProizvoda() { return nazivProizvoda; }
    public void setNazivProizvoda(String nazivProizvoda) { this.nazivProizvoda = nazivProizvoda; }
    public double getKolicina() { return kolicina; }
    public void setKolicina(double kolicina) { this.kolicina = kolicina; }
    public BigDecimal getCena() { return cena; }
    public void setCena(BigDecimal cena) { this.cena = cena; }
}
