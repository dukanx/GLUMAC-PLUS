package com.glumacplus.food_ordering.model;

import jakarta.persistence.*;
        import java.time.LocalDateTime;


@Entity
@Table(name = "korisnik")
public class Korisnik {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String ime;

    @Column(nullable = false,unique = true)
    private String email;

    @Column(nullable = false)
    private String lozinka;

    @Column(name = "broj_bodova")
    private double brojBodova;

    @ManyToOne
    @JoinColumn(name = "loyalty_program_id")
    private LoyaltyProgram loyaltyProgram;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Uloga uloga;

    @Column(name = "zadnja_upotreba_popusta")
    private LocalDateTime zadnjaUpotrebaPopusta;

    public Korisnik() {}

    public Korisnik(String ime, String email, String lozinka, double brojBodova, Uloga uloga) {
        this.ime = ime;
        this.email = email;
        this.lozinka = lozinka;
        this.brojBodova = brojBodova;
        this.uloga=uloga;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIme() { return ime; }
    public void setIme(String ime) { this.ime = ime; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getLozinka() { return lozinka; }
    public void setLozinka(String lozinka) { this.lozinka = lozinka; }

    public double getBrojBodova() { return brojBodova; }
    public void setBrojBodova(double brojBodova) { this.brojBodova = brojBodova; }

    public LoyaltyProgram getLoyaltyProgram() { return loyaltyProgram; }
    public void setLoyaltyProgram(LoyaltyProgram loyaltyProgram) { this.loyaltyProgram = loyaltyProgram; }

    public Uloga getUloga() { return uloga; }
    public void setUloga(Uloga uloga) { this.uloga = uloga; }

    public LocalDateTime getZadnjaUpotrebaPopusta() { return zadnjaUpotrebaPopusta; }
    public void setZadnjaUpotrebaPopusta(LocalDateTime zadnjaUpotrebaPopusta) { this.zadnjaUpotrebaPopusta = zadnjaUpotrebaPopusta; }
}

