package com.glumacplus.food_ordering.dto;

import java.util.ArrayList;
import java.util.List;

public class OmiljenaPorudzbinaStavkaViewDto {

    private Long proizvodId;
    private String nazivProizvoda;
    private double kolicina;
    private List<OmiljenaStavkaDodatakViewDto> dodaci = new ArrayList<>();

    public List<OmiljenaStavkaDodatakViewDto> getDodaci() {
        return dodaci;
    }

    public void setDodaci(List<OmiljenaStavkaDodatakViewDto> dodaci) {
        this.dodaci = dodaci == null ? new ArrayList<>() : dodaci;
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

    public double getKolicina() {
        return kolicina;
    }

    public void setKolicina(double kolicina) {
        this.kolicina = kolicina;
    }
}
