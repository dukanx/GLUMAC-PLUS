package com.glumacplus.food_ordering.model;

import jakarta.persistence.*;
import org.hibernate.annotations.BatchSize;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashSet;
import java.util.Set;

//@BatchSize dodat da kada lista stavki učitava povezane proizvode (ManyToOne EAGER),
// proizvodi se ne povlače jedan po jedan kroz dodatne upite,
// već Hibernate grupiše više ID-jeva i učitava ih odjednom pomoću IN upita.
@Entity
@Table(name = "proizvod")
@BatchSize(size = 100)
public class Proizvod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String naziv;
    private String tip;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal cena;

    private String jedinicaMere;
    private double kalorije;
    private double proteini;
    private double masti;
    private double ugljeniHidrati;

    @ManyToMany
    @JoinTable(
        name = "proizvod_alergen",
        joinColumns = @JoinColumn(name = "proizvod_id"),
        inverseJoinColumns = @JoinColumn(name = "alergen_id")
    )
    private Set<Alergen> alergeni = new HashSet<>();

    public Proizvod() {}

    public Proizvod(String naziv, String tip, BigDecimal cena, String jedinicaMere,
                    double kalorije, double proteini, double masti, double ugljeniHidrati) {
        this.naziv = naziv;
        this.tip = tip;
        setCena(cena);
        this.jedinicaMere = jedinicaMere;
        this.kalorije = kalorije;
        this.proteini = proteini;
        this.masti = masti;
        this.ugljeniHidrati = ugljeniHidrati;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNaziv() { return naziv; }
    public void setNaziv(String naziv) { this.naziv = naziv; }

    public String getTip() { return tip; }
    public void setTip(String tip) { this.tip = tip; }

    public BigDecimal getCena() { return cena; }
    public void setCena(BigDecimal cena) {
        this.cena = cena == null ? null : cena.setScale(2, RoundingMode.HALF_UP);
    }

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

    public Set<Alergen> getAlergeni() { return alergeni; }
    public void setAlergeni(Set<Alergen> alergeni) { this.alergeni = alergeni; }
}
