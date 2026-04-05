package com.glumacplus.food_ordering.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifikacija")
public class Notifikacija {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "korisnik_id", nullable = false)
    private Korisnik korisnik;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String poruka;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 64)
    private NotifikacijaTip tip;

    @Column(nullable = false)
    private Boolean procitana;

    @Column(nullable = false)
    private LocalDateTime datum;

    public Notifikacija() {
        this.tip = NotifikacijaTip.RUCNO;
        this.procitana = false;
        this.datum = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.tip == null) {
            this.tip = NotifikacijaTip.RUCNO;
        }
        if (this.procitana == null) {
            this.procitana = false;
        }
        if (this.datum == null) {
            this.datum = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Korisnik getKorisnik() {
        return korisnik;
    }

    public void setKorisnik(Korisnik korisnik) {
        this.korisnik = korisnik;
    }

    public String getPoruka() {
        return poruka;
    }

    public void setPoruka(String poruka) {
        this.poruka = poruka;
    }

    public NotifikacijaTip getTip() {
        return tip;
    }

    public void setTip(NotifikacijaTip tip) {
        this.tip = tip;
    }

    public Boolean getProcitana() {
        return procitana;
    }

    public void setProcitana(Boolean procitana) {
        this.procitana = procitana;
    }

    public LocalDateTime getDatum() {
        return datum;
    }

    public void setDatum(LocalDateTime datum) {
        this.datum = datum;
    }
}
