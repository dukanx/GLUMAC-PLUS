
package com.glumacplus.food_ordering.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
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

    @Column(name = "ukupan_iznos", precision = 12, scale = 2)
    private BigDecimal ukupanIznos;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusPorudzbine status;

    @Column(name = "originalna_cena", precision = 12, scale = 2)
    private BigDecimal originalnaCena;

    @Column(columnDefinition = "TEXT")
    private String napomena;

    @Enumerated(EnumType.STRING)
    @Column(name = "tip_porudzbine", nullable = false)
    private TipPorudzbine tipPorudzbine;

    @Column(name = "procenjeno_vreme")
    private Integer procenjenoVreme;

    @OneToMany(mappedBy = "porudzbina", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StavkaPorudzbine> stavke = new ArrayList<>();



    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "korisnik_id")
    private Korisnik korisnik;

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

    public Porudzbina(BigDecimal ukupanIznos) {
        setUkupanIznos(ukupanIznos);
        this.datum = LocalDateTime.now();
        this.status = StatusPorudzbine.U_PRIPREMI;
        this.tipPorudzbine = TipPorudzbine.ZA_PONETI;
    }
    public Porudzbina() {
        this.datum = LocalDateTime.now();
        this.status = StatusPorudzbine.U_PRIPREMI;
        this.ukupanIznos = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        this.originalnaCena = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
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

    public BigDecimal getUkupanIznos() {
        return ukupanIznos;
    }

    public void setUkupanIznos(BigDecimal ukupanIznos) {
        this.ukupanIznos = ukupanIznos == null ? null : ukupanIznos.setScale(2, RoundingMode.HALF_UP);
    }

    public StatusPorudzbine getStatus() {
        return status;
    }

    public void setStatus(StatusPorudzbine status) {
        this.status = status;
    }

    public BigDecimal getOriginalnaCena() {
        return originalnaCena;
    }

    public void setOriginalnaCena(BigDecimal originalnaCena) {
        this.originalnaCena = originalnaCena == null ? null : originalnaCena.setScale(2, RoundingMode.HALF_UP);
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

    public Korisnik getKorisnik() {
        return korisnik;
    }

    public void setKorisnik(Korisnik korisnik) {
        this.korisnik = korisnik;
    }

    @Transient
    public Long getKorisnikId() {
        return korisnik != null ? korisnik.getId() : null;
    }
}
