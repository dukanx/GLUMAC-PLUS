package com.glumacplus.food_ordering.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProizvodViewDto {
    private Long id;
    private String naziv;
    private String tip;
    private BigDecimal cena;
    private String jedinicaMere;
    private double kalorije, proteini, masti, ugljeniHidrati;
    private List<String> alergeniNazivi = new ArrayList<>();


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public List<String> getAlergeniNazivi() { return alergeniNazivi; }
    public void setAlergeniNazivi(List<String> alergeniNazivi) { this.alergeniNazivi = alergeniNazivi; }
}
