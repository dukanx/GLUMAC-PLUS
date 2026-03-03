package com.glumacplus.food_ordering.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "loyalty_program")
public class LoyaltyProgram {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nivo;

    private double popust;

    @Column(name = "prag_bodova")
    private int pragBodova;

    @OneToMany(mappedBy = "loyaltyProgram")
    private List<Korisnik> korisnici;

    public LoyaltyProgram() {}


    public LoyaltyProgram(String nivo, double popust, int pragBodova) {
        this.nivo = nivo;
        this.popust = popust;
        this.pragBodova = pragBodova;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNivo() { return nivo; }
    public void setNivo(String nivo) { this.nivo = nivo; }

    public double getPopust() { return popust; }
    public void setPopust(double popust) { this.popust = popust; }

    public List<Korisnik> getKorisnici() { return korisnici; }
    public void setKorisnici(List<Korisnik> korisnici) { this.korisnici = korisnici; }

    public int getPragBodova() {
        return pragBodova;
    }

    public void setPragBodova(int pragBodova) {
        this.pragBodova = pragBodova;
    }
}

