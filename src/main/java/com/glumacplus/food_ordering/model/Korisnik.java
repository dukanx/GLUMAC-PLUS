package com.glumacplus.food_ordering.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Predstavlja korisnika sistema za naručivanje hrane.
 *
 * <p>Korisnik može biti administrator, zaposleni ili obični korisnik koji
 * naručuje hranu. Svaki korisnik pripada jednom loyalty programu i skuplja
 * bodove na osnovu realizovanih porudžbina.</p>
 *
 * @author Nikola Dukić
 * @version 1.0
 */
@Entity
@Table(name = "korisnik")
public class Korisnik {

    /** Jedinstveni identifikator korisnika. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Ime korisnika. */
    @Column(nullable = false)
    private String ime;

    /** Email korisnika, jedinstven u sistemu (koristi se za prijavu). */
    @Column(nullable = false,unique = true)
    private String email;

    /** Heširana lozinka korisnika. */
    @Column(nullable = false)
    private String lozinka;

    /** Trenutni broj sakupljenih loyalty bodova. */
    @Column(name = "broj_bodova")
    private double brojBodova;

    /** Loyalty program (nivo) kom korisnik trenutno pripada. */
    @ManyToOne
    @JoinColumn(name = "loyalty_program_id")
    private LoyaltyProgram loyaltyProgram;

    /** Uloga korisnika koja određuje prava pristupa. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Uloga uloga;

    /** Datum i vreme poslednje upotrebe popusta. */
    @Column(name = "zadnja_upotreba_popusta")
    private LocalDateTime zadnjaUpotrebaPopusta;

    /**
     * Podrazumevani konstruktor.
     */
    public Korisnik() {}

    /**
     * Kreira korisnika sa zadatim osnovnim podacima.
     *
     * @param ime ime korisnika
     * @param email email korisnika (jedinstven)
     * @param lozinka heširana lozinka korisnika
     * @param brojBodova početni broj loyalty bodova
     * @param uloga uloga korisnika u sistemu
     */
    public Korisnik(String ime, String email, String lozinka, double brojBodova, Uloga uloga) {
        this.ime = ime;
        this.email = email;
        this.lozinka = lozinka;
        this.brojBodova = brojBodova;
        this.uloga=uloga;
    }

    /**
     * Vraća identifikator korisnika.
     *
     * @return identifikator korisnika
     */
    public Long getId() { return id; }

    /**
     * Postavlja identifikator korisnika.
     *
     * @param id identifikator korisnika
     */
    public void setId(Long id) { this.id = id; }

    /**
     * Vraća ime korisnika.
     *
     * @return ime korisnika
     */
    public String getIme() { return ime; }

    /**
     * Postavlja ime korisnika.
     *
     * @param ime ime korisnika; ne sme biti {@code null} niti prazno
     * @throws IllegalArgumentException ako je ime {@code null} ili prazno
     */
    public void setIme(String ime) {
        if (ime == null || ime.isBlank()) {
            throw new IllegalArgumentException("Ime je obavezno");
        }
        this.ime = ime;
    }

    /**
     * Vraća email korisnika.
     *
     * @return email korisnika
     */
    public String getEmail() { return email; }

    /**
     * Postavlja email korisnika.
     *
     * @param email email korisnika; ne sme biti {@code null} niti prazan
     * @throws IllegalArgumentException ako je email {@code null} ili prazan
     */
    public void setEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email je obavezan");
        }
        this.email = email;
    }

    /**
     * Vraća heširanu lozinku korisnika.
     *
     * @return heširana lozinka korisnika
     */
    public String getLozinka() { return lozinka; }

    /**
     * Postavlja heširanu lozinku korisnika.
     *
     * @param lozinka heširana lozinka korisnika; ne sme biti {@code null} niti prazna
     * @throws IllegalArgumentException ako je lozinka {@code null} ili prazna
     */
    public void setLozinka(String lozinka) {
        if (lozinka == null || lozinka.isBlank()) {
            throw new IllegalArgumentException("Lozinka je obavezna");
        }
        this.lozinka = lozinka;
    }

    /**
     * Vraća trenutni broj loyalty bodova.
     *
     * @return broj loyalty bodova
     */
    public double getBrojBodova() { return brojBodova; }

    /**
     * Postavlja broj loyalty bodova.
     *
     * @param brojBodova broj loyalty bodova; ne sme biti negativan
     * @throws IllegalArgumentException ako je broj bodova negativan
     */
    public void setBrojBodova(double brojBodova) {
        if (brojBodova < 0) {
            throw new IllegalArgumentException("Broj bodova ne sme biti negativan");
        }
        this.brojBodova = brojBodova;
    }

    /**
     * Vraća loyalty program kom korisnik pripada.
     *
     * @return loyalty program korisnika
     */
    public LoyaltyProgram getLoyaltyProgram() { return loyaltyProgram; }

    /**
     * Postavlja loyalty program korisnika.
     *
     * @param loyaltyProgram loyalty program korisnika
     */
    public void setLoyaltyProgram(LoyaltyProgram loyaltyProgram) { this.loyaltyProgram = loyaltyProgram; }

    /**
     * Vraća ulogu korisnika.
     *
     * @return uloga korisnika
     */
    public Uloga getUloga() { return uloga; }

    /**
     * Postavlja ulogu korisnika.
     *
     * @param uloga uloga korisnika; ne sme biti {@code null}
     * @throws IllegalArgumentException ako je uloga {@code null}
     */
    public void setUloga(Uloga uloga) {
        if (uloga == null) {
            throw new IllegalArgumentException("Uloga je obavezna");
        }
        this.uloga = uloga;
    }

    /**
     * Vraća datum i vreme poslednje upotrebe popusta.
     *
     * @return datum poslednje upotrebe popusta
     */
    public LocalDateTime getZadnjaUpotrebaPopusta() { return zadnjaUpotrebaPopusta; }

    /**
     * Postavlja datum i vreme poslednje upotrebe popusta.
     *
     * @param zadnjaUpotrebaPopusta datum poslednje upotrebe popusta
     */
    public void setZadnjaUpotrebaPopusta(LocalDateTime zadnjaUpotrebaPopusta) { this.zadnjaUpotrebaPopusta = zadnjaUpotrebaPopusta; }
}
