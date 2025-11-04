package com.glumacplus.food_ordering.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "loyalty_program")
public class LoyaltyProgram {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nivo;
    private double popust;

    // Veza sa korisnicima (jedan loyalty program ima više korisnika)
    @OneToMany(mappedBy = "loyaltyProgram")
    private List<Korisnik> korisnici;

    // Prazan konstruktor
    public LoyaltyProgram() {}

    // Konstruktor
    public LoyaltyProgram(String nivo, double popust) {
        this.nivo = nivo;
        this.popust = popust;
    }

    // Getteri i setteri
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNivo() { return nivo; }
    public void setNivo(String nivo) { this.nivo = nivo; }

    public double getPopust() { return popust; }
    public void setPopust(double popust) { this.popust = popust; }

    public List<Korisnik> getKorisnici() { return korisnici; }
    public void setKorisnici(List<Korisnik> korisnici) { this.korisnici = korisnici; }
}

