package com.glumacplus.food_ordering.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Dodatak izabran uz jednu stavku porudžbine (npr. "Nutela" uz palačinku).
 *
 * <p>Cena se pamti kao snapshot u trenutku porudžbine, pa kasnija promena
 * cene proizvoda ne menja već napravljene porudžbine.</p>
 *
 * @author Nikola Dukić
 * @version 1.0
 */
@Entity
@Table(name = "stavka_dodatak")
public class StavkaDodatak {

    /** Jedinstveni identifikator dodatka na stavci. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Stavka porudžbine na koju se dodatak odnosi. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stavka_id", nullable = false)
    @NotNull
    private StavkaPorudzbine stavka;

    /** Proizvod-dodatak (tip {@link Proizvod#TIP_DODACI}). */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "proizvod_id", nullable = false)
    @NotNull
    private Proizvod proizvod;

    /** Količina dodatka po jednoj jedinici osnovnog proizvoda. */
    @Positive
    private double kolicina = 1;

    /** Cena dodatka u trenutku porudžbine, zaokružena na dve decimale. */
    @Positive
    @Column(precision = 12, scale = 2)
    private BigDecimal cena;

    /**
     * Podrazumevani konstruktor.
     */
    public StavkaDodatak() {}

    /**
     * Kreira dodatak sa zadatim proizvodom, količinom i cenom.
     *
     * @param proizvod proizvod-dodatak
     * @param kolicina količina dodatka
     * @param cena cena dodatka u trenutku porudžbine
     */
    public StavkaDodatak(Proizvod proizvod, double kolicina, BigDecimal cena) {
        setProizvod(proizvod);
        setKolicina(kolicina);
        setCena(cena);
    }

    /**
     * Vraća iznos dodatka po jednoj jedinici osnovnog proizvoda
     * ({@code kolicina * cena}).
     *
     * @return iznos dodatka, ili {@link BigDecimal#ZERO} ako cena nije postavljena
     */
    public BigDecimal getIznos() {
        if (cena == null) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(kolicina).multiply(cena).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Vraća identifikator.
     *
     * @return identifikator dodatka na stavci
     */
    public Long getId() { return id; }

    /**
     * Postavlja identifikator.
     *
     * @param id identifikator dodatka na stavci
     */
    public void setId(Long id) { this.id = id; }

    /**
     * Vraća stavku kojoj dodatak pripada.
     *
     * @return stavka porudžbine
     */
    public StavkaPorudzbine getStavka() { return stavka; }

    /**
     * Postavlja stavku kojoj dodatak pripada.
     *
     * @param stavka stavka porudžbine
     */
    public void setStavka(StavkaPorudzbine stavka) { this.stavka = stavka; }

    /**
     * Vraća proizvod-dodatak.
     *
     * @return proizvod-dodatak
     */
    public Proizvod getProizvod() { return proizvod; }

    /**
     * Postavlja proizvod-dodatak.
     *
     * @param proizvod proizvod-dodatak; ne sme biti {@code null}
     * @throws IllegalArgumentException ako je proizvod {@code null}
     */
    public void setProizvod(Proizvod proizvod) {
        if (proizvod == null) {
            throw new IllegalArgumentException("Proizvod je obavezan");
        }
        this.proizvod = proizvod;
    }

    /**
     * Vraća količinu dodatka.
     *
     * @return količina
     */
    public double getKolicina() { return kolicina; }

    /**
     * Postavlja količinu dodatka.
     *
     * @param kolicina količina; mora biti veća od nule
     * @throws IllegalArgumentException ako je količina manja ili jednaka nuli
     */
    public void setKolicina(double kolicina) {
        if (kolicina <= 0) {
            throw new IllegalArgumentException("Količina mora biti veća od nule");
        }
        this.kolicina = kolicina;
    }

    /**
     * Vraća cenu dodatka.
     *
     * @return cena dodatka
     */
    public BigDecimal getCena() { return cena; }

    /**
     * Postavlja cenu dodatka, zaokruženu na dve decimale (HALF_UP).
     *
     * @param cena cena; ne sme biti {@code null} niti manja ili jednaka nuli
     * @throws IllegalArgumentException ako je cena {@code null} ili nije pozitivna
     */
    public void setCena(BigDecimal cena) {
        if (cena == null) {
            throw new IllegalArgumentException("Cena je obavezna");
        }
        if (cena.signum() <= 0) {
            throw new IllegalArgumentException("Cena mora biti veća od nule");
        }
        this.cena = cena.setScale(2, RoundingMode.HALF_UP);
    }
}
