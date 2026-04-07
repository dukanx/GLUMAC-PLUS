package com.glumacplus.food_ordering.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Entity
@Table(name = "stavka_porudzbine")
public class StavkaPorudzbine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Positive
    private double kolicina;


    @Positive
    @Column(precision = 12, scale = 2)
    private BigDecimal cena;


    @Positive
    @Column(precision = 12, scale = 2)
    private BigDecimal iznosStavke;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "porudzbina_id", nullable = false)
    @NotNull
    private Porudzbina porudzbina;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "proizvod_id", nullable = false)
    @NotNull
    private Proizvod proizvod;

    public StavkaPorudzbine() {}

    public StavkaPorudzbine(double kolicina, BigDecimal cena, Porudzbina porudzbina, Proizvod proizvod) {
        this.kolicina = kolicina;
        setCena(cena);
        this.porudzbina = porudzbina;
        this.proizvod = proizvod;
    }


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public double getKolicina() { return kolicina; }
    public void setKolicina(double kolicina) {
        this.kolicina = kolicina;
        recalculateIznosStavke();
    }

    public BigDecimal getCena() { return cena; }
    public void setCena(BigDecimal cena) {
        this.cena = cena == null ? null : cena.setScale(2, RoundingMode.HALF_UP);
        recalculateIznosStavke();
    }

    public BigDecimal getIznosStavke() { return iznosStavke; }
    public void setIznosStavke(BigDecimal iznosStavke) {
        this.iznosStavke = iznosStavke == null ? null : iznosStavke.setScale(2, RoundingMode.HALF_UP);
    }

    public Porudzbina getPorudzbina() { return porudzbina; }
    public void setPorudzbina(Porudzbina porudzbina) { this.porudzbina = porudzbina; }

    public Proizvod getProizvod() { return proizvod; }
    public void setProizvod(Proizvod proizvod) { this.proizvod = proizvod; }

    private void recalculateIznosStavke() {
        if (this.cena == null) {
            this.iznosStavke = null;
            return;
        }
        this.iznosStavke = BigDecimal.valueOf(this.kolicina)
                .multiply(this.cena)
                .setScale(2, RoundingMode.HALF_UP);
    }

}
