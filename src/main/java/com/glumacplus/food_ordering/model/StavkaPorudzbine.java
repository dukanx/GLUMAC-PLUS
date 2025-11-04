package com.glumacplus.food_ordering.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "stavka_porudzbine")
public class StavkaPorudzbine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Koliko kom/g/ml… (double po tvojoj želji) */
    @Positive
    private double kolicina;

    /** Jedinična cena u trenutku poručivanja (snapshot) */
    @Positive
    private double cena;

    /** Ukupan iznos stavke = kolicina * cena (snapshot) */
    @Positive
    private double iznosStavke;

    /** Veza ka porudžbini (više stavki pripada jednoj porudžbini) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "porudzbina_id", nullable = false)
    @NotNull
    private Porudzbina porudzbina;

    /** Veza ka proizvodu (više stavki može referencirati isti proizvod) */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "proizvod_id", nullable = false)
    @NotNull
    private Proizvod proizvod;

    public StavkaPorudzbine() {}

    public StavkaPorudzbine(double kolicina, double cena, Porudzbina porudzbina, Proizvod proizvod) {
        this.kolicina = kolicina;
        this.cena = cena;
        this.iznosStavke = kolicina * cena;
        this.porudzbina = porudzbina;
        this.proizvod = proizvod;
    }

    // Getteri / setteri
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public double getKolicina() { return kolicina; }
    public void setKolicina(double kolicina) {
        this.kolicina = kolicina;
        this.iznosStavke = this.kolicina * this.cena;
    }

    public double getCena() { return cena; }
    public void setCena(double cena) {
        this.cena = cena;
        this.iznosStavke = this.kolicina * this.cena;
    }

    public double getIznosStavke() { return iznosStavke; }
    public void setIznosStavke(double iznosStavke) { this.iznosStavke = iznosStavke; }

    public Porudzbina getPorudzbina() { return porudzbina; }
    public void setPorudzbina(Porudzbina porudzbina) { this.porudzbina = porudzbina; }

    public Proizvod getProizvod() { return proizvod; }
    public void setProizvod(Proizvod proizvod) { this.proizvod = proizvod; }
}

