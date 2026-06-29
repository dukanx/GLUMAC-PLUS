package com.glumacplus.food_ordering.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Predstavlja jednu stavku porudžbine — konkretan proizvod sa količinom.
 *
 * <p>Iznos stavke ({@code iznosStavke}) se automatski preračunava kao
 * {@code kolicina * cena} pri svakoj izmeni količine ili cene.</p>
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
     * @param kolicina količina
     */
    public void setKolicina(double kolicina) {
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
     * @param cena cena
     */
    public void setCena(BigDecimal cena) {
        this.cena = cena == null ? null : cena.setScale(2, RoundingMode.HALF_UP);
        recalculateIznosStavke();
    }

    /**
     * Vraća ukupan iznos stavke.
     *
     * @return iznos stavke
     */
    public BigDecimal getIznosStavke() { return iznosStavke; }

    /**
     * Postavlja ukupan iznos stavke, zaokružen na dve decimale (HALF_UP).
     *
     * @param iznosStavke iznos stavke
     */
    public void setIznosStavke(BigDecimal iznosStavke) {
        this.iznosStavke = iznosStavke == null ? null : iznosStavke.setScale(2, RoundingMode.HALF_UP);
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
     * @param porudzbina porudžbina
     */
    public void setPorudzbina(Porudzbina porudzbina) { this.porudzbina = porudzbina; }

    /**
     * Vraća proizvod na koji se stavka odnosi.
     *
     * @return proizvod
     */
    public Proizvod getProizvod() { return proizvod; }

    /**
     * Postavlja proizvod na koji se stavka odnosi.
     *
     * @param proizvod proizvod
     */
    public void setProizvod(Proizvod proizvod) { this.proizvod = proizvod; }

    /**
     * Preračunava iznos stavke kao {@code kolicina * cena}. Ako cena nije
     * postavljena, iznos se postavlja na {@code null}.
     */
    private void recalculateIznosStavke() {
        if (this.cena == null) {
            this.iznosStavke = null;
            return;
        }
        this.iznosStavke = BigDecimal.valueOf(this.kolicina)
                .multiply(this.cena)
                .setScale(2, RoundingMode.HALF_UP);
    }

}
