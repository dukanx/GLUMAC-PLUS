package com.glumacplus.food_ordering.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.glumacplus.food_ordering.model.TipPorudzbine;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties(value = {"korisnikId"})
public class PorudzbinaDto {

    private TipPorudzbine tipPorudzbine;

    @Size(max = 1000, message = "Napomena može imati najviše 1000 karaktera")
    private String napomena;

    @NotEmpty(message = "Porudžbina mora imati bar jednu stavku")
    @Valid
    private List<StavkaPorudzbineDto> stavke = new ArrayList<>();

    public TipPorudzbine getTipPorudzbine() { return tipPorudzbine; }
    public void setTipPorudzbine(TipPorudzbine tipPorudzbine) { this.tipPorudzbine = tipPorudzbine; }
    public String getNapomena() { return napomena; }
    public void setNapomena(String napomena) { this.napomena = napomena; }
    public List<StavkaPorudzbineDto> getStavke() { return stavke; }
    public void setStavke(List<StavkaPorudzbineDto> stavke) { this.stavke = stavke; }
}
