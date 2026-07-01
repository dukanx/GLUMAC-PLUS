package com.glumacplus.food_ordering.model;

import jakarta.persistence.*;
import org.hibernate.annotations.BatchSize;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashSet;
import java.util.Set;

/**
 * Predstavlja proizvod (artikal) iz menija koji korisnik može da naruči.
 *
 * <p>Sadrži osnovne podatke o ceni i nutritivnim vrednostima, kao i skup
 * alergena koje proizvod sadrži.</p>
 *
 * @author Nikola Dukić
 * @version 1.0
 */
//@BatchSize dodat da kada lista stavki učitava povezane proizvode (ManyToOne EAGER),
// proizvodi se ne povlače jedan po jedan kroz dodatne upite,
// već Hibernate grupiše više ID-jeva i učitava ih odjednom pomoću IN upita.
@Entity
@Table(name = "proizvod")
@BatchSize(size = 100)
public class Proizvod {

    /** Jedinstveni identifikator proizvoda. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Naziv proizvoda. */
    @Column(nullable = false)
    private String naziv;

    /** Tip (kategorija) proizvoda. */
    private String tip;

    /** Cena proizvoda, zaokružena na dve decimale. */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal cena;

    /** Jedinica mere proizvoda (npr. komad, gram). */
    private String jedinicaMere;

    /** Energetska vrednost u kalorijama. */
    private double kalorije;

    /** Količina proteina. */
    private double proteini;

    /** Količina masti. */
    private double masti;

    /** Količina ugljenih hidrata. */
    private double ugljeniHidrati;

    /** Skup alergena koje proizvod sadrži. */
    @ManyToMany
    @JoinTable(
        name = "proizvod_alergen",
        joinColumns = @JoinColumn(name = "proizvod_id"),
        inverseJoinColumns = @JoinColumn(name = "alergen_id")
    )
    private Set<Alergen> alergeni = new HashSet<>();

    /**
     * Podrazumevani konstruktor.
     */
    public Proizvod() {}

    /**
     * Kreira proizvod sa zadatim podacima.
     *
     * @param naziv naziv proizvoda
     * @param tip tip (kategorija) proizvoda
     * @param cena cena proizvoda
     * @param jedinicaMere jedinica mere
     * @param kalorije energetska vrednost u kalorijama
     * @param proteini količina proteina
     * @param masti količina masti
     * @param ugljeniHidrati količina ugljenih hidrata
     */
    public Proizvod(String naziv, String tip, BigDecimal cena, String jedinicaMere,
                    double kalorije, double proteini, double masti, double ugljeniHidrati) {
        this.naziv = naziv;
        this.tip = tip;
        setCena(cena);
        this.jedinicaMere = jedinicaMere;
        this.kalorije = kalorije;
        this.proteini = proteini;
        this.masti = masti;
        this.ugljeniHidrati = ugljeniHidrati;
    }

    /**
     * Vraća identifikator proizvoda.
     *
     * @return identifikator proizvoda
     */
    public Long getId() { return id; }

    /**
     * Postavlja identifikator proizvoda.
     *
     * @param id identifikator proizvoda
     */
    public void setId(Long id) { this.id = id; }

    /**
     * Vraća naziv proizvoda.
     *
     * @return naziv proizvoda
     */
    public String getNaziv() { return naziv; }

    /**
     * Postavlja naziv proizvoda.
     *
     * @param naziv naziv proizvoda; ne sme biti {@code null} niti prazan
     * @throws IllegalArgumentException ako je naziv {@code null} ili prazan
     */
    public void setNaziv(String naziv) {
        if (naziv == null || naziv.isBlank()) {
            throw new IllegalArgumentException("Naziv je obavezan");
        }
        this.naziv = naziv;
    }

    /**
     * Vraća tip proizvoda.
     *
     * @return tip proizvoda
     */
    public String getTip() { return tip; }

    /**
     * Postavlja tip proizvoda.
     *
     * @param tip tip proizvoda
     */
    public void setTip(String tip) { this.tip = tip; }

    /**
     * Vraća cenu proizvoda.
     *
     * @return cena proizvoda
     */
    public BigDecimal getCena() { return cena; }

    /**
     * Postavlja cenu proizvoda, zaokruženu na dve decimale (HALF_UP).
     *
     * @param cena cena proizvoda; ne sme biti {@code null} niti manja ili jednaka nuli
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

    /**
     * Vraća jedinicu mere proizvoda.
     *
     * @return jedinica mere
     */
    public String getJedinicaMere() { return jedinicaMere; }

    /**
     * Postavlja jedinicu mere proizvoda.
     *
     * @param jedinicaMere jedinica mere
     */
    public void setJedinicaMere(String jedinicaMere) { this.jedinicaMere = jedinicaMere; }

    /**
     * Vraća energetsku vrednost u kalorijama.
     *
     * @return broj kalorija
     */
    public double getKalorije() { return kalorije; }

    /**
     * Postavlja energetsku vrednost u kalorijama.
     *
     * @param kalorije broj kalorija; ne sme biti negativan
     * @throws IllegalArgumentException ako je broj kalorija negativan
     */
    public void setKalorije(double kalorije) {
        if (kalorije < 0) {
            throw new IllegalArgumentException("Kalorije ne smeju biti negativne");
        }
        this.kalorije = kalorije;
    }

    /**
     * Vraća količinu proteina.
     *
     * @return količina proteina
     */
    public double getProteini() { return proteini; }

    /**
     * Postavlja količinu proteina.
     *
     * @param proteini količina proteina; ne sme biti negativna
     * @throws IllegalArgumentException ako je količina proteina negativna
     */
    public void setProteini(double proteini) {
        if (proteini < 0) {
            throw new IllegalArgumentException("Proteini ne smeju biti negativni");
        }
        this.proteini = proteini;
    }

    /**
     * Vraća količinu masti.
     *
     * @return količina masti
     */
    public double getMasti() { return masti; }

    /**
     * Postavlja količinu masti.
     *
     * @param masti količina masti; ne sme biti negativna
     * @throws IllegalArgumentException ako je količina masti negativna
     */
    public void setMasti(double masti) {
        if (masti < 0) {
            throw new IllegalArgumentException("Masti ne smeju biti negativne");
        }
        this.masti = masti;
    }

    /**
     * Vraća količinu ugljenih hidrata.
     *
     * @return količina ugljenih hidrata
     */
    public double getUgljeniHidrati() { return ugljeniHidrati; }

    /**
     * Postavlja količinu ugljenih hidrata.
     *
     * @param ugljeniHidrati količina ugljenih hidrata; ne sme biti negativna
     * @throws IllegalArgumentException ako je količina ugljenih hidrata negativna
     */
    public void setUgljeniHidrati(double ugljeniHidrati) {
        if (ugljeniHidrati < 0) {
            throw new IllegalArgumentException("Ugljeni hidrati ne smeju biti negativni");
        }
        this.ugljeniHidrati = ugljeniHidrati;
    }

    /**
     * Vraća skup alergena koje proizvod sadrži.
     *
     * @return skup alergena
     */
    public Set<Alergen> getAlergeni() { return alergeni; }

    /**
     * Postavlja skup alergena koje proizvod sadrži.
     *
     * @param alergeni skup alergena
     */
    public void setAlergeni(Set<Alergen> alergeni) { this.alergeni = alergeni; }
}
