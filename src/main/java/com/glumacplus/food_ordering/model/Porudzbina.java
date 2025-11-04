package com.glumacplus.food_ordering.model;

import jakarta.persistence.*;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "porudzbina")
public class Porudzbina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Temporal(TemporalType.TIMESTAMP)
    private Date datum;

    private double ukupanIznos;

    @Enumerated(EnumType.STRING)
    private StatusPorudzbine status;

    // Veza: jedna porudzbina pripada jednom korisniku
    @ManyToOne
    @JoinColumn(name = "korisnik_id")
    private Korisnik korisnik;

    // Veza: jedna porudzbina ima više stavki
    @OneToMany(mappedBy = "porudzbina", cascade = CascadeType.ALL)
    private List<StavkaPorudzbine> stavke;

    public Porudzbina() {}

    public Porudzbina(Date datum, double ukupanIznos, StatusPorudzbine status, Korisnik korisnik) {
        this.datum = datum;
        this.ukupanIznos = ukupanIznos;
        this.status = status;
        this.korisnik = korisnik;
    }

    // Getteri i setteri
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Date getDatum() { return datum; }
    public void setDatum(Date datum) { this.datum = datum; }

    public double getUkupanIznos() { return ukupanIznos; }
    public void setUkupanIznos(double ukupanIznos) { this.ukupanIznos = ukupanIznos; }

    public StatusPorudzbine getStatus() { return status; }
    public void setStatus(StatusPorudzbine status) { this.status = status; }

    public Korisnik getKorisnik() { return korisnik; }
    public void setKorisnik(Korisnik korisnik) { this.korisnik = korisnik; }

    public List<StavkaPorudzbine> getStavke() { return stavke; }
    public void setStavke(List<StavkaPorudzbine> stavke) { this.stavke = stavke; }
}
