package com.glumacplus.food_ordering.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "omiljena_porudzbina_stavka")
public class OmiljenaPorudzbinaStavka {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "omiljena_porudzbina_id", nullable = false)
    @NotNull
    private OmiljenaPorudzbina omiljenaPorudzbina;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "proizvod_id", nullable = false)
    @NotNull
    private Proizvod proizvod;

    @Positive
    @Column(nullable = false)
    private double kolicina;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public OmiljenaPorudzbina getOmiljenaPorudzbina() {
        return omiljenaPorudzbina;
    }

    public void setOmiljenaPorudzbina(OmiljenaPorudzbina omiljenaPorudzbina) {
        this.omiljenaPorudzbina = omiljenaPorudzbina;
    }

    public Proizvod getProizvod() {
        return proizvod;
    }

    public void setProizvod(Proizvod proizvod) {
        this.proizvod = proizvod;
    }

    public double getKolicina() {
        return kolicina;
    }

    public void setKolicina(double kolicina) {
        this.kolicina = kolicina;
    }
}
