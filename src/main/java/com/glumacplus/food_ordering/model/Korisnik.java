package com.glumacplus.food_ordering.model;

import jakarta.persistence.*;

@Entity
@Table(name = "korisnik")
public class Korisnik {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String ime;
    private String email;
    private String lozinka;
    private double brojBodova;

    // Veza sa loyalty programom (mnogo korisnika može imati isti program)
    @ManyToOne
    @JoinColumn(name = "loyalty_program_id")
    private LoyaltyProgram loyaltyProgram;

    // Prazan konstruktor
    public Korisnik() {}

    // Konstruktor
    public Korisnik(String ime, String email, String lozinka, double brojBodova) {
        this.ime = ime;
        this.email = email;
        this.lozinka = lozinka;
        this.brojBodova = brojBodova;
    }

    // Getteri i setteri
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
}

