
package com.glumacplus.food_ordering.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity

@Table(name = "porudzbine")
public class Porudzbina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime datum;

    @Column(name = "ukupan_iznos")
    private double ukupanIznos;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusPorudzbine status;

    @Column(name = "originalna_cena")
    private double originalnaCena;

    @Column(columnDefinition = "TEXT")
    private String napomena;

    @Enumerated(EnumType.STRING)
    @Column(name = "tip_porudzbine", nullable = false)
    private TipPorudzbine tipPorudzbine;

    @Column(name = "procenjeno_vreme")
    private Integer procenjenoVreme;

    @OneToMany(mappedBy = "porudzbina", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StavkaPorudzbine> stavke = new ArrayList<>();



    @Column(name = "korisnik_id")
    private Long korisnikId;


    public Long getKorisnikId() {
        return korisnikId;
    }

    public void setKorisnikId(Long korisnikId) {
        this.korisnikId = korisnikId;
    }

    public List<StavkaPorudzbine> getStavke() {
        return stavke;
    }

    public void setStavke(List<StavkaPorudzbine> stavke) {
        this.stavke = stavke;
    }


    public void dodajStavku(StavkaPorudzbine stavka) {
        stavke.add(stavka);
        stavka.setPorudzbina(this);
    }

    public Porudzbina(Double ukupanIznos) {
        this.ukupanIznos = ukupanIznos;
        this.datum = LocalDateTime.now();
        this.status = StatusPorudzbine.U_PRIPREMI;
        this.tipPorudzbine = TipPorudzbine.ZA_PONETI;
    }
    public Porudzbina() {
        this.datum = LocalDateTime.now();
        this.status = StatusPorudzbine.U_PRIPREMI;
        this.ukupanIznos = 0.0;
        this.tipPorudzbine = TipPorudzbine.ZA_PONETI;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getDatum() {
        return datum;
    }

    public void setDatum(LocalDateTime datum) {
        this.datum = datum;
    }

    public double getUkupanIznos() {
        return ukupanIznos;
    }

    public void setUkupanIznos(double ukupanIznos) {
        this.ukupanIznos = ukupanIznos;
    }

    public StatusPorudzbine getStatus() {
        return status;
    }

    public void setStatus(StatusPorudzbine status) {
        this.status = status;
    }

    public double getOriginalnaCena() {
        return originalnaCena;
    }

    public void setOriginalnaCena(double originalnaCena) {
        this.originalnaCena = originalnaCena;
    }

    public String getNapomena() {
        return napomena;
    }

    public void setNapomena(String napomena) {
        this.napomena = napomena;
    }

    public TipPorudzbine getTipPorudzbine() {
        return tipPorudzbine;
    }

    public void setTipPorudzbine(TipPorudzbine tipPorudzbine) {
        this.tipPorudzbine = tipPorudzbine;
    }

    public Integer getProcenjenoVreme() {
        return procenjenoVreme;
    }

    public void setProcenjenoVreme(Integer procenjenoVreme) {
        this.procenjenoVreme = procenjenoVreme;
    }
}
