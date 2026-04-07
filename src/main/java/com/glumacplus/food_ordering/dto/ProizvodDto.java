package com.glumacplus.food_ordering.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.*;

public class ProizvodDto {
    @NotBlank(message = "Naziv je obavezan")
    private String naziv;

    @NotBlank(message = "Tip je obavezan")
    private String tip;

    @NotNull(message = "Cena je obavezna")
    @DecimalMin(value = "0.01", message = "Cena mora biti pozitivna")
    private BigDecimal cena;

    @NotBlank(message = "Jedinica mere je obavezna")
    private String jedinicaMere;

    @PositiveOrZero private double kalorije;
    @PositiveOrZero private double proteini;
    @PositiveOrZero private double masti;
    @PositiveOrZero private double ugljeniHidrati;


    public String getNaziv() { return naziv; }
    public void setNaziv(String naziv) { this.naziv = naziv; }
    public String getTip() { return tip; }
    public void setTip(String tip) { this.tip = tip; }
    public BigDecimal getCena() { return cena; }
    public void setCena(BigDecimal cena) { this.cena = cena; }
    public String getJedinicaMere() { return jedinicaMere; }
    public void setJedinicaMere(String jedinicaMere) { this.jedinicaMere = jedinicaMere; }
    public double getKalorije() { return kalorije; }
    public void setKalorije(double kalorije) { this.kalorije = kalorije; }
    public double getProteini() { return proteini; }
    public void setProteini(double proteini) { this.proteini = proteini; }
    public double getMasti() { return masti; }
    public void setMasti(double masti) { this.masti = masti; }
    public double getUgljeniHidrati() { return ugljeniHidrati; }
    public void setUgljeniHidrati(double ugljeniHidrati) { this.ugljeniHidrati = ugljeniHidrati; }
}
