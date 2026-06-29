package com.glumacplus.food_ordering.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Predstavlja omiljenu (sačuvanu) porudžbinu korisnika.
 *
 * <p>Korisnik može sačuvati postojeću porudžbinu kao omiljenu kako bi je
 * kasnije lako ponovio. Sadrži listu stavki sa proizvodima i količinama.</p>
 *
 * @author Nikola Dukić
 * @version 1.0
 */
@Entity
@Table(name = "omiljena_porudzbina")
public class OmiljenaPorudzbina {

    /** Jedinstveni identifikator omiljene porudžbine. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Korisnik kome omiljena porudžbina pripada. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "korisnik_id", nullable = false)
    private Korisnik korisnik;

    /** Naziv omiljene porudžbine. */
    @Column(nullable = false)
    private String naziv;

    /** Datum i vreme kreiranja omiljene porudžbine. */
    @Column(name = "datum_kreiranja", nullable = false)
    private LocalDateTime datumKreiranja;

    /** Lista stavki omiljene porudžbine. */
    @OneToMany(mappedBy = "omiljenaPorudzbina", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OmiljenaPorudzbinaStavka> stavke = new ArrayList<>();

    /**
     * Podrazumevani konstruktor.
     */
    public OmiljenaPorudzbina() {}

    /**
     * Dodaje stavku u omiljenu porudžbinu i postavlja bidirekcionu vezu
     * (stavci postavlja referencu na ovu omiljenu porudžbinu).
     *
     * @param stavka stavka koja se dodaje
     */
    public void dodajStavku(OmiljenaPorudzbinaStavka stavka) {
        stavke.add(stavka);
        stavka.setOmiljenaPorudzbina(this);
    }

    /**
     * Vraća identifikator omiljene porudžbine.
     *
     * @return identifikator
     */
    public Long getId() {
        return id;
    }

    /**
     * Postavlja identifikator omiljene porudžbine.
     *
     * @param id identifikator
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Vraća korisnika kome omiljena porudžbina pripada.
     *
     * @return korisnik
     */
    public Korisnik getKorisnik() {
        return korisnik;
    }

    /**
     * Postavlja korisnika kome omiljena porudžbina pripada.
     *
     * @param korisnik korisnik
     */
    public void setKorisnik(Korisnik korisnik) {
        this.korisnik = korisnik;
    }

    /**
     * Vraća naziv omiljene porudžbine.
     *
     * @return naziv
     */
    public String getNaziv() {
        return naziv;
    }

    /**
     * Postavlja naziv omiljene porudžbine.
     *
     * @param naziv naziv
     */
    public void setNaziv(String naziv) {
        this.naziv = naziv;
    }

    /**
     * Vraća datum i vreme kreiranja.
     *
     * @return datum kreiranja
     */
    public LocalDateTime getDatumKreiranja() {
        return datumKreiranja;
    }

    /**
     * Postavlja datum i vreme kreiranja.
     *
     * @param datumKreiranja datum kreiranja
     */
    public void setDatumKreiranja(LocalDateTime datumKreiranja) {
        this.datumKreiranja = datumKreiranja;
    }

    /**
     * Vraća listu stavki omiljene porudžbine.
     *
     * @return lista stavki
     */
    public List<OmiljenaPorudzbinaStavka> getStavke() {
        return stavke;
    }

    /**
     * Postavlja listu stavki omiljene porudžbine.
     *
     * @param stavke lista stavki
     */
    public void setStavke(List<OmiljenaPorudzbinaStavka> stavke) {
        this.stavke = stavke;
    }

    /**
     * Vraća identifikator korisnika kome omiljena porudžbina pripada, ili
     * {@code null} ako korisnik nije postavljen. Izvedeno polje koje se ne
     * mapira u bazu.
     *
     * @return identifikator korisnika ili {@code null}
     */
    @Transient
    public Long getKorisnikId() {
        return korisnik != null ? korisnik.getId() : null;
    }
}
