package com.glumacplus.food_ordering.dto;

/**
 * Prikaz jednog dodatka uz stavku omiljene porudžbine.
 *
 * <p>Cene nema jer je omiljena porudžbina šablon — frontend cenu čita iz
 * aktuelnog kataloga po {@code proizvodId}.</p>
 */
public class OmiljenaStavkaDodatakViewDto {

    private Long proizvodId;
    private String nazivProizvoda;
    private double kolicina;

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

    public double getKolicina() {
        return kolicina;
    }

    public void setKolicina(double kolicina) {
        this.kolicina = kolicina;
    }
}
