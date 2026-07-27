package com.glumacplus.food_ordering.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Dodatak zapamćen uz stavku omiljene porudžbine (npr. "Banana" uz palačinku).
 *
 * <p>Za razliku od {@link StavkaDodatak}, ovde se cena <b>ne</b> pamti: omiljena
 * porudžbina je šablon za buduće naručivanje, pa cena treba da bude ona koja
 * važi u trenutku kad se šablon iskoristi.</p>
 *
 * @author Nikola Dukić
 * @version 1.0
 */
@Entity
@Table(name = "omiljena_stavka_dodatak")
public class OmiljenaStavkaDodatak {

    /** Jedinstveni identifikator dodatka na stavci omiljene porudžbine. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Stavka omiljene porudžbine na koju se dodatak odnosi. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "omiljena_stavka_id", nullable = false)
    @NotNull
    private OmiljenaPorudzbinaStavka stavka;

    /** Proizvod-dodatak (tip {@link Proizvod#TIP_DODACI}). */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "proizvod_id", nullable = false)
    @NotNull
    private Proizvod proizvod;

    /** Količina dodatka po jednoj jedinici osnovnog proizvoda. */
    @Positive
    @Column(nullable = false)
    private double kolicina = 1;

    /**
     * Podrazumevani konstruktor.
     */
    public OmiljenaStavkaDodatak() {}

    /**
     * Kreira dodatak sa zadatim proizvodom i količinom.
     *
     * @param proizvod proizvod-dodatak
     * @param kolicina količina dodatka
     */
    public OmiljenaStavkaDodatak(Proizvod proizvod, double kolicina) {
        setProizvod(proizvod);
        setKolicina(kolicina);
    }

    /**
     * Vraća identifikator.
     *
     * @return identifikator dodatka
     */
    public Long getId() { return id; }

    /**
     * Postavlja identifikator.
     *
     * @param id identifikator dodatka
     */
    public void setId(Long id) { this.id = id; }

    /**
     * Vraća stavku kojoj dodatak pripada.
     *
     * @return stavka omiljene porudžbine
     */
    public OmiljenaPorudzbinaStavka getStavka() { return stavka; }

    /**
     * Postavlja stavku kojoj dodatak pripada.
     *
     * @param stavka stavka omiljene porudžbine
     */
    public void setStavka(OmiljenaPorudzbinaStavka stavka) { this.stavka = stavka; }

    /**
     * Vraća proizvod-dodatak.
     *
     * @return proizvod-dodatak
     */
    public Proizvod getProizvod() { return proizvod; }

    /**
     * Postavlja proizvod-dodatak.
     *
     * @param proizvod proizvod-dodatak; ne sme biti {@code null}
     * @throws IllegalArgumentException ako je proizvod {@code null}
     */
    public void setProizvod(Proizvod proizvod) {
        if (proizvod == null) {
            throw new IllegalArgumentException("Proizvod je obavezan");
        }
        this.proizvod = proizvod;
    }

    /**
     * Vraća količinu dodatka.
     *
     * @return količina
     */
    public double getKolicina() { return kolicina; }

    /**
     * Postavlja količinu dodatka.
     *
     * @param kolicina količina; mora biti veća od nule
     * @throws IllegalArgumentException ako je količina manja ili jednaka nuli
     */
    public void setKolicina(double kolicina) {
        if (kolicina <= 0) {
            throw new IllegalArgumentException("Količina mora biti veća od nule");
        }
        this.kolicina = kolicina;
    }
}
