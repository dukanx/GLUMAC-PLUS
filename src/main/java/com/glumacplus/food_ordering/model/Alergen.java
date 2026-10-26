package com.glumacplus.food_ordering.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

/**
 * Predstavlja alergen koji proizvod može da sadrži.
 *
 * <p>Povezan je sa proizvodima vezom više-na-više; jedan alergen može biti
 * prisutan u više proizvoda.</p>
 *
 * @author Nikola Dukić
 * @version 1.0
 */
@Entity
@Table(name = "alergen")
public class Alergen {

    /** Jedinstveni identifikator alergena. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Naziv alergena, jedinstven u sistemu. */
    @Column(nullable = false, unique = true)
    private String naziv;

    /** Opis alergena. */
    @Column(columnDefinition = "TEXT")
    private String opis;

    /** Skup proizvoda koji sadrže ovaj alergen. */
    @ManyToMany(mappedBy = "alergeni")
    @JsonIgnore
    private Set<Proizvod> proizvodi = new HashSet<>();

    /**
     * Podrazumevani konstruktor.
     */
    public Alergen() {}

    /**
     * Kreira alergen sa zadatim nazivom i opisom.
     *
     * @param naziv naziv alergena
     * @param opis opis alergena
     */
    public Alergen(String naziv, String opis) {
        this.naziv = naziv;
        this.opis = opis;
    }

    /**
     * Vraća identifikator alergena.
     *
     * @return identifikator
     */
    public Long getId() {
        return id;
    }

    /**
     * Postavlja identifikator alergena.
     *
     * @param id identifikator
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Vraća naziv alergena.
     *
     * @return naziv
     */
    public String getNaziv() {
        return naziv;
    }

    /**
     * Postavlja naziv alergena.
     *
     * @param naziv naziv; ne sme biti {@code null} niti prazan
     * @throws IllegalArgumentException ako je naziv {@code null} ili prazan
     */
    public void setNaziv(String naziv) {
        if (naziv == null || naziv.isBlank()) {
            throw new IllegalArgumentException("Naziv je obavezan");
        }
        this.naziv = naziv;
    }

    /**
     * Vraća opis alergena.
     *
     * @return opis
     */
    public String getOpis() {
        return opis;
    }

    /**
     * Postavlja opis alergena.
     *
     * @param opis opis
     */
    public void setOpis(String opis) {
        this.opis = opis;
    }

    /**
     * Vraća skup proizvoda koji sadrže ovaj alergen.
     *
     * @return skup proizvoda
     */
    public Set<Proizvod> getProizvodi() {
        return proizvodi;
    }

    /**
     * Postavlja skup proizvoda koji sadrže ovaj alergen.
     *
     * @param proizvodi skup proizvoda
     */
    public void setProizvodi(Set<Proizvod> proizvodi) {
        this.proizvodi = proizvodi;
    }
}
