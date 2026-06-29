package com.glumacplus.food_ordering.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Predstavlja jednu stavku omiljene porudžbine — proizvod sa količinom.
 *
 * @author Nikola Dukić
 * @version 1.0
 */
@Entity
@Table(name = "omiljena_porudzbina_stavka")
public class OmiljenaPorudzbinaStavka {

    /** Jedinstveni identifikator stavke. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Omiljena porudžbina kojoj stavka pripada. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "omiljena_porudzbina_id", nullable = false)
    @NotNull
    private OmiljenaPorudzbina omiljenaPorudzbina;

    /** Proizvod na koji se stavka odnosi. */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "proizvod_id", nullable = false)
    @NotNull
    private Proizvod proizvod;

    /** Količina proizvoda. */
    @Positive
    @Column(nullable = false)
    private double kolicina;

    /**
     * Vraća identifikator stavke.
     *
     * @return identifikator
     */
    public Long getId() {
        return id;
    }

    /**
     * Postavlja identifikator stavke.
     *
     * @param id identifikator
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Vraća omiljenu porudžbinu kojoj stavka pripada.
     *
     * @return omiljena porudžbina
     */
    public OmiljenaPorudzbina getOmiljenaPorudzbina() {
        return omiljenaPorudzbina;
    }

    /**
     * Postavlja omiljenu porudžbinu kojoj stavka pripada.
     *
     * @param omiljenaPorudzbina omiljena porudžbina
     */
    public void setOmiljenaPorudzbina(OmiljenaPorudzbina omiljenaPorudzbina) {
        this.omiljenaPorudzbina = omiljenaPorudzbina;
    }

    /**
     * Vraća proizvod na koji se stavka odnosi.
     *
     * @return proizvod
     */
    public Proizvod getProizvod() {
        return proizvod;
    }

    /**
     * Postavlja proizvod na koji se stavka odnosi.
     *
     * @param proizvod proizvod
     */
    public void setProizvod(Proizvod proizvod) {
        this.proizvod = proizvod;
    }

    /**
     * Vraća količinu proizvoda.
     *
     * @return količina
     */
    public double getKolicina() {
        return kolicina;
    }

    /**
     * Postavlja količinu proizvoda.
     *
     * @param kolicina količina
     */
    public void setKolicina(double kolicina) {
        this.kolicina = kolicina;
    }
}
