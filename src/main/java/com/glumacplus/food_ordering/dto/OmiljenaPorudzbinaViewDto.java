package com.glumacplus.food_ordering.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class OmiljenaPorudzbinaViewDto {

    private Long id;
    private String naziv;
    private LocalDateTime datumKreiranja;
    private List<OmiljenaPorudzbinaStavkaViewDto> stavke = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNaziv() {
        return naziv;
    }

    public void setNaziv(String naziv) {
        this.naziv = naziv;
    }

    public LocalDateTime getDatumKreiranja() {
        return datumKreiranja;
    }

    public void setDatumKreiranja(LocalDateTime datumKreiranja) {
        this.datumKreiranja = datumKreiranja;
    }

    public List<OmiljenaPorudzbinaStavkaViewDto> getStavke() {
        return stavke;
    }

    public void setStavke(List<OmiljenaPorudzbinaStavkaViewDto> stavke) {
        this.stavke = stavke;
    }
}
