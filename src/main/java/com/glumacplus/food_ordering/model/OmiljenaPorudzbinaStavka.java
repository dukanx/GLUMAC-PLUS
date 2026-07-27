package com.glumacplus.food_ordering.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.hibernate.annotations.BatchSize;

import java.util.ArrayList;
import java.util.List;

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

    /** Dodaci zapamćeni uz ovu stavku (prazno ako ih nema). */
    //@BatchSize kao i na ostalim kolekcijama — inače lista omiljenih šalje
    // poseban upit za dodatke svake stavke.
    @OneToMany(mappedBy = "stavka", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 100)
    private List<OmiljenaStavkaDodatak> dodaci = new ArrayList<>();

    /**
     * Dodaje dodatak na stavku i postavlja bidirekcionu vezu.
     *
     * @param dodatak dodatak koji se dodaje
     */
    public void dodajDodatak(OmiljenaStavkaDodatak dodatak) {
        dodaci.add(dodatak);
        dodatak.setStavka(this);
    }

    /**
     * Vraća dodatke zapamćene uz ovu stavku.
     *
     * @return lista dodataka (prazna ako ih nema)
     */
    public List<OmiljenaStavkaDodatak> getDodaci() {
        return dodaci;
    }

    /**
     * Postavlja dodatke uz ovu stavku.
     *
     * @param dodaci lista dodataka; {@code null} se tretira kao prazna lista
     */
    public void setDodaci(List<OmiljenaStavkaDodatak> dodaci) {
        this.dodaci = dodaci == null ? new ArrayList<>() : dodaci;
    }

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
     * @param omiljenaPorudzbina omiljena porudžbina; ne sme biti {@code null}
     * @throws IllegalArgumentException ako je omiljena porudžbina {@code null}
     */
    public void setOmiljenaPorudzbina(OmiljenaPorudzbina omiljenaPorudzbina) {
        if (omiljenaPorudzbina == null) {
            throw new IllegalArgumentException("Omiljena porudžbina je obavezna");
        }
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
     * @param proizvod proizvod; ne sme biti {@code null}
     * @throws IllegalArgumentException ako je proizvod {@code null}
     */
    public void setProizvod(Proizvod proizvod) {
        if (proizvod == null) {
            throw new IllegalArgumentException("Proizvod je obavezan");
        }
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
