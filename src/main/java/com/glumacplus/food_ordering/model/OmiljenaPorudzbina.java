package com.glumacplus.food_ordering.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "omiljena_porudzbina")
public class OmiljenaPorudzbina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "korisnik_id", nullable = false)
    private Long korisnikId;

    @Column(nullable = false)
    private String naziv;

    @Column(name = "datum_kreiranja", nullable = false)
    private LocalDateTime datumKreiranja;

    @OneToMany(mappedBy = "omiljenaPorudzbina", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OmiljenaPorudzbinaStavka> stavke = new ArrayList<>();

    public OmiljenaPorudzbina() {
        this.datumKreiranja = LocalDateTime.now();
    }

    public void dodajStavku(OmiljenaPorudzbinaStavka stavka) {
        stavke.add(stavka);
        stavka.setOmiljenaPorudzbina(this);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getKorisnikId() {
        return korisnikId;
    }

    public void setKorisnikId(Long korisnikId) {
        this.korisnikId = korisnikId;
    }

    public String getNaziv() {
        return naziv;
    }

    public void setNaziv(String naziv) {
        this.naziv = naziv;
    }

    public LocalDateTime getDatumKreiranja() {
        return datumKreiranja;
    }

    public void setDatumKreiranja(LocalDateTime datumKreiranja) {
        this.datumKreiranja = datumKreiranja;
    }

    public List<OmiljenaPorudzbinaStavka> getStavke() {
        return stavke;
    }

    public void setStavke(List<OmiljenaPorudzbinaStavka> stavke) {
        this.stavke = stavke;
    }
}
