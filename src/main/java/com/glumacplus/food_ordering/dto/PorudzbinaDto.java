package com.glumacplus.food_ordering.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

public class PorudzbinaDto {


    private Long korisnikId;

    @NotEmpty(message = "Porudžbina mora imati bar jednu stavku")
    @Valid
    private List<StavkaPorudzbineDto> stavke = new ArrayList<>();


    public Long getKorisnikId() { return korisnikId; }
    public void setKorisnikId(Long korisnikId) { this.korisnikId = korisnikId; }
    public List<StavkaPorudzbineDto> getStavke() { return stavke; }
    public void setStavke(List<StavkaPorudzbineDto> stavke) { this.stavke = stavke; }
}