package com.glumacplus.food_ordering.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import com.glumacplus.food_ordering.util.Novac;
import org.hibernate.annotations.BatchSize;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * Predstavlja jednu stavku porudžbine — konkretan proizvod sa količinom
 * i opcionim dodacima.
 *
 * <p>Iznos stavke ({@code iznosStavke}) se automatski preračunava kao
 * {@code kolicina * (cena + zbir dodataka)} pri svakoj izmeni količine,
 * cene ili liste dodataka.</p>
 *
 * @author Nikola Dukić
 * @version 1.0
 */
@Entity
@Table(name = "stavka_porudzbine")
public class StavkaPorudzbine {

    /** Jedinstveni identifikator stavke. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Količina naručenog proizvoda. */
    @Positive
    private double kolicina;

    /** Cena proizvoda u trenutku porudžbine, zaokružena na dve decimale. */
    @Positive
    @Column(precision = 12, scale = 2)
    private BigDecimal cena;

    /** Ukupan iznos stavke ({@code kolicina * cena}). */
    @Positive
    @Column(precision = 12, scale = 2)
    private BigDecimal iznosStavke;

    /** Porudžbina kojoj stavka pripada. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "porudzbina_id", nullable = false)
    @NotNull
    private Porudzbina porudzbina;

    /** Proizvod na koji se stavka odnosi. */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "proizvod_id", nullable = false)
    @NotNull
    private Proizvod proizvod;

    /** Dodaci izabrani uz ovu stavku (npr. Nutela uz palačinku). */
    //@BatchSize iz istog razloga kao na `Porudzbina.stavke` — bez njega mapiranje
    // liste porudžbina šalje poseban upit za dodatke svake pojedinačne stavke.
    @OneToMany(mappedBy = "stavka", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 100)
    private List<StavkaDodatak> dodaci = new ArrayList<>();

    /**
     * Podrazumevani konstruktor.
     */
    public StavkaPorudzbine() {}

    /**
     * Kreira stavku porudžbine sa zadatim podacima. Iznos stavke se
     * automatski izračunava na osnovu količine i cene.
     *
     * @param kolicina količina proizvoda
     * @param cena cena proizvoda
     * @param porudzbina porudžbina kojoj stavka pripada
     * @param proizvod proizvod na koji se stavka odnosi
     */
    public StavkaPorudzbine(double kolicina, BigDecimal cena, Porudzbina porudzbina, Proizvod proizvod) {
        this.kolicina = kolicina;
        setCena(cena);
        this.porudzbina = porudzbina;
        this.proizvod = proizvod;
    }

    /**
     * Vraća identifikator stavke.
     *
     * @return identifikator stavke
     */
    public Long getId() { return id; }

    /**
     * Postavlja identifikator stavke.
     *
     * @param id identifikator stavke
     */
    public void setId(Long id) { this.id = id; }

    /**
     * Vraća količinu proizvoda.
     *
     * @return količina
     */
    public double getKolicina() { return kolicina; }

    /**
     * Postavlja količinu proizvoda i preračunava iznos stavke.
     *
     * @param kolicina količina; mora biti veća od nule
     * @throws IllegalArgumentException ako je količina manja ili jednaka nuli
     */
    public void setKolicina(double kolicina) {
        if (kolicina <= 0) {
            throw new IllegalArgumentException("Količina mora biti veća od nule");
        }
        this.kolicina = kolicina;
        recalculateIznosStavke();
    }

    /**
     * Vraća cenu proizvoda.
     *
     * @return cena
     */
    public BigDecimal getCena() { return cena; }

    /**
     * Postavlja cenu proizvoda (zaokruženu na dve decimale) i preračunava
     * iznos stavke.
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
        recalculateIznosStavke();
    }

    /**
     * Vraća ukupan iznos stavke.
     *
     * @return iznos stavke
     */
    public BigDecimal getIznosStavke() { return iznosStavke; }

    /**
     * Postavlja ukupan iznos stavke, zaokružen na ceo dinar (HALF_UP).
     *
     * @param iznosStavke iznos stavke
     */
    public void setIznosStavke(BigDecimal iznosStavke) {
        this.iznosStavke = Novac.zaokruzi(iznosStavke);
    }

    /**
     * Vraća porudžbinu kojoj stavka pripada.
     *
     * @return porudžbina
     */
    public Porudzbina getPorudzbina() { return porudzbina; }

    /**
     * Postavlja porudžbinu kojoj stavka pripada.
     *
     * @param porudzbina porudžbina; ne sme biti {@code null}
     * @throws IllegalArgumentException ako je porudžbina {@code null}
     */
    public void setPorudzbina(Porudzbina porudzbina) {
        if (porudzbina == null) {
            throw new IllegalArgumentException("Porudžbina je obavezna");
        }
        this.porudzbina = porudzbina;
    }

    /**
     * Vraća proizvod na koji se stavka odnosi.
     *
     * @return proizvod
     */
    public Proizvod getProizvod() { return proizvod; }

    /**
     * Postavlja proizvod na koji se stavka odnosi.
     *
     * @param proizvod proizvod; ne sme biti {@code null}
     * @throws IllegalArgumentException ako je proizvod {@code null}
     */
    public void setProizvod(Proizvod proizvod) {
        if (proizvod == null) {
            throw new IllegalArgumentException("Proizvod je obavezan");
        }
        this.proizvod = proizvod;
    }

    /**
     * Vraća dodatke izabrane uz ovu stavku.
     *
     * @return lista dodataka
     */
    public List<StavkaDodatak> getDodaci() { return dodaci; }

    /**
     * Postavlja dodatke uz ovu stavku i preračunava iznos stavke.
     *
     * @param dodaci lista dodataka
     */
    public void setDodaci(List<StavkaDodatak> dodaci) {
        this.dodaci = dodaci == null ? new ArrayList<>() : dodaci;
        this.dodaci.forEach(d -> d.setStavka(this));
        recalculateIznosStavke();
    }

    /**
     * Dodaje dodatak uz ovu stavku, povezuje ga sa stavkom i preračunava
     * iznos stavke.
     *
     * @param dodatak dodatak koji se dodaje
     */
    public void dodajDodatak(StavkaDodatak dodatak) {
        dodaci.add(dodatak);
        dodatak.setStavka(this);
        recalculateIznosStavke();
    }

    /**
     * Vraća zbir iznosa svih dodataka po jednoj jedinici osnovnog proizvoda.
     *
     * @return zbir dodataka
     */
    public BigDecimal getIznosDodataka() {
        return dodaci.stream()
                .map(StavkaDodatak::getIznos)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Preračunava iznos stavke kao {@code kolicina * (cena + zbir dodataka)}.
     * Ako cena nije postavljena, iznos se postavlja na {@code null}.
     */
    private void recalculateIznosStavke() {
        if (this.cena == null) {
            this.iznosStavke = null;
            return;
        }
        // Ceo dinar, da zbir linija na računu tačno daje osnovicu (vidi Novac).
        this.iznosStavke = Novac.zaokruzi(BigDecimal.valueOf(this.kolicina)
                .multiply(this.cena.add(getIznosDodataka())));
    }

}
