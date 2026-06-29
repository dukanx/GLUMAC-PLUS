package com.glumacplus.food_ordering.model;

import jakarta.persistence.*;
import java.util.List;

/**
 * Predstavlja nivo loyalty programa.
 *
 * <p>Svaki nivo ima prag bodova potreban za njegovo dostizanje i procenat
 * popusta koji korisnik na tom nivou ostvaruje pri naručivanju.</p>
 *
 * @author Nikola Dukić
 * @version 1.0
 */
@Entity
@Table(name = "loyalty_program")
public class LoyaltyProgram {

    /** Jedinstveni identifikator nivoa. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Naziv nivoa (npr. "Nova zvezda", "Srebrna"). */
    @Column(nullable = false)
    private String nivo;

    /** Procenat popusta koji nivo donosi. */
    private double popust;

    /** Broj bodova potreban za dostizanje ovog nivoa. */
    @Column(name = "prag_bodova")
    private int pragBodova;

    /** Korisnici koji trenutno pripadaju ovom nivou. */
    @OneToMany(mappedBy = "loyaltyProgram")
    private List<Korisnik> korisnici;

    /**
     * Podrazumevani konstruktor.
     */
    public LoyaltyProgram() {}

    /**
     * Kreira loyalty nivo sa zadatim podacima.
     *
     * @param nivo naziv nivoa
     * @param popust procenat popusta
     * @param pragBodova prag bodova za dostizanje nivoa
     */
    public LoyaltyProgram(String nivo, double popust, int pragBodova) {
        this.nivo = nivo;
        this.popust = popust;
        this.pragBodova = pragBodova;
    }

    /**
     * Vraća identifikator nivoa.
     *
     * @return identifikator
     */
    public Long getId() { return id; }

    /**
     * Postavlja identifikator nivoa.
     *
     * @param id identifikator
     */
    public void setId(Long id) { this.id = id; }

    /**
     * Vraća naziv nivoa.
     *
     * @return naziv nivoa
     */
    public String getNivo() { return nivo; }

    /**
     * Postavlja naziv nivoa.
     *
     * @param nivo naziv nivoa
     */
    public void setNivo(String nivo) { this.nivo = nivo; }

    /**
     * Vraća procenat popusta.
     *
     * @return procenat popusta
     */
    public double getPopust() { return popust; }

    /**
     * Postavlja procenat popusta.
     *
     * @param popust procenat popusta
     */
    public void setPopust(double popust) { this.popust = popust; }

    /**
     * Vraća korisnike koji pripadaju ovom nivou.
     *
     * @return lista korisnika
     */
    public List<Korisnik> getKorisnici() { return korisnici; }

    /**
     * Postavlja korisnike koji pripadaju ovom nivou.
     *
     * @param korisnici lista korisnika
     */
    public void setKorisnici(List<Korisnik> korisnici) { this.korisnici = korisnici; }

    /**
     * Vraća prag bodova za dostizanje nivoa.
     *
     * @return prag bodova
     */
    public int getPragBodova() {
        return pragBodova;
    }

    /**
     * Postavlja prag bodova za dostizanje nivoa.
     *
     * @param pragBodova prag bodova
     */
    public void setPragBodova(int pragBodova) {
        this.pragBodova = pragBodova;
    }
}
