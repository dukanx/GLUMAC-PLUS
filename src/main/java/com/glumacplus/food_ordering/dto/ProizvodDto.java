package com.glumacplus.food_ordering.dto;

import com.glumacplus.food_ordering.model.Ukus;

import java.math.BigDecimal;
import jakarta.validation.constraints.*;

public class ProizvodDto {
    @NotBlank(message = "Naziv je obavezan")
    private String naziv;

    @NotBlank(message = "Tip je obavezan")
    private String tip;

    /** Opis je opcion — većina stavki nabraja sastojke već u nazivu. */
    @Size(max = 500, message = "Opis može imati najviše 500 karaktera")
    private String opis;

    @NotNull(message = "Cena je obavezna")
    @DecimalMin(value = "0.01", message = "Cena mora biti pozitivna")
    private BigDecimal cena;

    /**
     * Opciono. Nijedan proizvod u bazi nema popunjenu jedinicu mere i nigde se
     * ne prikazuje — dok je bila obavezna, admin panel ne bi mogao da sačuva
     * proizvod bez izmišljene vrednosti.
     */
    private String jedinicaMere;

    /** Ukus (SLATKO/SLANO) — određuje koji dodaci smeju uz stavku; {@code null} za piće. */
    private Ukus ukus;

    @PositiveOrZero private double kalorije;
    @PositiveOrZero private double proteini;
    @PositiveOrZero private double masti;
    @PositiveOrZero private double ugljeniHidrati;

    /** Dostupnost; ako je {@code null} pri kreiranju, podrazumeva se {@code true}. */
    private Boolean dostupan;


    public String getNaziv() { return naziv; }
    public void setNaziv(String naziv) { this.naziv = naziv; }
    public String getTip() { return tip; }
    public void setTip(String tip) { this.tip = tip; }
    public String getOpis() { return opis; }
    public void setOpis(String opis) { this.opis = opis; }
    public BigDecimal getCena() { return cena; }
    public void setCena(BigDecimal cena) { this.cena = cena; }
    public String getJedinicaMere() { return jedinicaMere; }
    public void setJedinicaMere(String jedinicaMere) { this.jedinicaMere = jedinicaMere; }
    public Ukus getUkus() { return ukus; }
    public void setUkus(Ukus ukus) { this.ukus = ukus; }
    public double getKalorije() { return kalorije; }
    public void setKalorije(double kalorije) { this.kalorije = kalorije; }
    public double getProteini() { return proteini; }
    public void setProteini(double proteini) { this.proteini = proteini; }
    public double getMasti() { return masti; }
    public void setMasti(double masti) { this.masti = masti; }
    public double getUgljeniHidrati() { return ugljeniHidrati; }
    public void setUgljeniHidrati(double ugljeniHidrati) { this.ugljeniHidrati = ugljeniHidrati; }
    public Boolean getDostupan() { return dostupan; }
    public void setDostupan(Boolean dostupan) { this.dostupan = dostupan; }
}
