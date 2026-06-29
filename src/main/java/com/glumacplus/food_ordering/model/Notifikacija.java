package com.glumacplus.food_ordering.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Predstavlja notifikaciju (obaveštenje) upućeno korisniku.
 *
 * <p>Notifikacija nosi poruku, tip (povod) i status pročitanosti. Najčešće se
 * kreira automatski pri promeni stanja porudžbine ili napretku u loyalty
 * programu.</p>
 *
 * @author Nikola Dukić
 * @version 1.0
 */
@Entity
@Table(name = "notifikacija")
public class Notifikacija {

    /** Jedinstveni identifikator notifikacije. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Korisnik kome je notifikacija upućena. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "korisnik_id", nullable = false)
    private Korisnik korisnik;

    /** Tekst poruke notifikacije. */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String poruka;

    /** Tip (povod) notifikacije. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 64)
    private NotifikacijaTip tip;

    /** Oznaka da li je notifikacija pročitana. */
    @Column(nullable = false)
    private Boolean procitana;

    /** Datum i vreme kreiranja notifikacije. */
    @Column(nullable = false)
    private LocalDateTime datum;

    /**
     * Podrazumevani konstruktor. Postavlja tip na
     * {@link NotifikacijaTip#RUCNO} i status pročitanosti na {@code false}.
     */
    public Notifikacija() {
        this.tip = NotifikacijaTip.RUCNO;
        this.procitana = false;
    }

    /**
     * JPA callback koji se poziva pre upisa u bazu. Postavlja podrazumevane
     * vrednosti za tip i status pročitanosti ako nisu zadate.
     */
    @PrePersist
    protected void onCreate() {
        if (this.tip == null) {
            this.tip = NotifikacijaTip.RUCNO;
        }
        if (this.procitana == null) {
            this.procitana = false;
        }
    }

    /**
     * Vraća identifikator notifikacije.
     *
     * @return identifikator
     */
    public Long getId() {
        return id;
    }

    /**
     * Postavlja identifikator notifikacije.
     *
     * @param id identifikator
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Vraća korisnika kome je notifikacija upućena.
     *
     * @return korisnik
     */
    public Korisnik getKorisnik() {
        return korisnik;
    }

    /**
     * Postavlja korisnika kome je notifikacija upućena.
     *
     * @param korisnik korisnik
     */
    public void setKorisnik(Korisnik korisnik) {
        this.korisnik = korisnik;
    }

    /**
     * Vraća tekst poruke.
     *
     * @return poruka
     */
    public String getPoruka() {
        return poruka;
    }

    /**
     * Postavlja tekst poruke.
     *
     * @param poruka poruka
     */
    public void setPoruka(String poruka) {
        this.poruka = poruka;
    }

    /**
     * Vraća tip notifikacije.
     *
     * @return tip notifikacije
     */
    public NotifikacijaTip getTip() {
        return tip;
    }

    /**
     * Postavlja tip notifikacije.
     *
     * @param tip tip notifikacije
     */
    public void setTip(NotifikacijaTip tip) {
        this.tip = tip;
    }

    /**
     * Vraća oznaku da li je notifikacija pročitana.
     *
     * @return {@code true} ako je pročitana, inače {@code false}
     */
    public Boolean getProcitana() {
        return procitana;
    }

    /**
     * Postavlja oznaku da li je notifikacija pročitana.
     *
     * @param procitana status pročitanosti
     */
    public void setProcitana(Boolean procitana) {
        this.procitana = procitana;
    }

    /**
     * Vraća datum i vreme kreiranja notifikacije.
     *
     * @return datum notifikacije
     */
    public LocalDateTime getDatum() {
        return datum;
    }

    /**
     * Postavlja datum i vreme kreiranja notifikacije.
     *
     * @param datum datum notifikacije
     */
    public void setDatum(LocalDateTime datum) {
        this.datum = datum;
    }
}
