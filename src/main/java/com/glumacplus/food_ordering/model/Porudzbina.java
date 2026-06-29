
package com.glumacplus.food_ordering.model;

import jakarta.persistence.*;
import org.hibernate.annotations.BatchSize;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Predstavlja porudžbinu koju korisnik kreira u sistemu.
 *
 * <p>Sadrži listu stavki, ukupan iznos (sa popustom) i originalnu cenu (bez
 * popusta), status u životnom ciklusu, tip preuzimanja i opciono procenjeno
 * vreme pripreme. Novčane vrednosti se čuvaju zaokružene na dve decimale.</p>
 *
 * @author Nikola Dukić
 * @version 1.0
 */
@Entity
@Table(name = "porudzbine")
public class Porudzbina {

    /** Jedinstveni identifikator porudžbine. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Datum i vreme kreiranja porudžbine. */
    @Column(nullable = false)
    private LocalDateTime datum;

    /** Ukupan iznos porudžbine sa uračunatim popustom. */
    @Column(name = "ukupan_iznos", precision = 12, scale = 2)
    private BigDecimal ukupanIznos;

    /** Trenutni status porudžbine. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusPorudzbine status;

    /** Originalna cena porudžbine, pre primene popusta. */
    @Column(name = "originalna_cena", precision = 12, scale = 2)
    private BigDecimal originalnaCena;

    /** Napomena korisnika uz porudžbinu. */
    @Column(columnDefinition = "TEXT")
    private String napomena;

    /** Tip porudžbine (način preuzimanja). */
    @Enumerated(EnumType.STRING)
    @Column(name = "tip_porudzbine", nullable = false)
    private TipPorudzbine tipPorudzbine;

    /** Procenjeno vreme pripreme u minutima (opciono). */
    @Column(name = "procenjeno_vreme")
    private Integer procenjenoVreme;

    /** Lista stavki porudžbine. */
    //@BatchSize smo i ovde dodali da kada se učitava više porudžbina, njihove stavke se povlače u grupama pomoću `IN` upita,
    // umesto da se za svaku porudžbinu šalje poseban upit. Prednost je što radi dobro i sa paginacijom, za razliku od `JOIN FETCH` pristupa.
    @OneToMany(mappedBy = "porudzbina", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 100)
    private List<StavkaPorudzbine> stavke = new ArrayList<>();

    /** Korisnik koji je kreirao porudžbinu. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "korisnik_id")
    private Korisnik korisnik;

    /**
     * Vraća listu stavki porudžbine.
     *
     * @return lista stavki
     */
    public List<StavkaPorudzbine> getStavke() {
        return stavke;
    }

    /**
     * Postavlja listu stavki porudžbine.
     *
     * @param stavke lista stavki
     */
    public void setStavke(List<StavkaPorudzbine> stavke) {
        this.stavke = stavke;
    }

    /**
     * Dodaje stavku u porudžbinu i postavlja bidirekcionu vezu
     * (stavci postavlja referencu na ovu porudžbinu).
     *
     * @param stavka stavka koja se dodaje
     */
    public void dodajStavku(StavkaPorudzbine stavka) {
        stavke.add(stavka);
        stavka.setPorudzbina(this);
    }

    /**
     * Kreira porudžbinu sa zadatim ukupnim iznosom. Status se postavlja na
     * {@link StatusPorudzbine#U_PRIPREMI}, a tip na
     * {@link TipPorudzbine#ZA_PONETI}.
     *
     * @param ukupanIznos ukupan iznos porudžbine
     */
    public Porudzbina(BigDecimal ukupanIznos) {
        setUkupanIznos(ukupanIznos);
        this.status = StatusPorudzbine.U_PRIPREMI;
        this.tipPorudzbine = TipPorudzbine.ZA_PONETI;
    }

    /**
     * Podrazumevani konstruktor. Postavlja status na
     * {@link StatusPorudzbine#U_PRIPREMI}, iznos i originalnu cenu na 0.00,
     * a tip na {@link TipPorudzbine#ZA_PONETI}.
     */
    public Porudzbina() {
        this.status = StatusPorudzbine.U_PRIPREMI;
        this.ukupanIznos = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        this.originalnaCena = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        this.tipPorudzbine = TipPorudzbine.ZA_PONETI;
    }

    /**
     * Vraća identifikator porudžbine.
     *
     * @return identifikator porudžbine
     */
    public Long getId() {
        return id;
    }

    /**
     * Postavlja identifikator porudžbine.
     *
     * @param id identifikator porudžbine
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Vraća datum i vreme kreiranja porudžbine.
     *
     * @return datum porudžbine
     */
    public LocalDateTime getDatum() {
        return datum;
    }

    /**
     * Postavlja datum i vreme kreiranja porudžbine.
     *
     * @param datum datum porudžbine
     */
    public void setDatum(LocalDateTime datum) {
        this.datum = datum;
    }

    /**
     * Vraća ukupan iznos porudžbine (sa popustom).
     *
     * @return ukupan iznos
     */
    public BigDecimal getUkupanIznos() {
        return ukupanIznos;
    }

    /**
     * Postavlja ukupan iznos porudžbine, zaokružen na dve decimale (HALF_UP).
     *
     * @param ukupanIznos ukupan iznos
     */
    public void setUkupanIznos(BigDecimal ukupanIznos) {
        this.ukupanIznos = ukupanIznos == null ? null : ukupanIznos.setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Vraća status porudžbine.
     *
     * @return status porudžbine
     */
    public StatusPorudzbine getStatus() {
        return status;
    }

    /**
     * Postavlja status porudžbine.
     *
     * @param status status porudžbine
     */
    public void setStatus(StatusPorudzbine status) {
        this.status = status;
    }

    /**
     * Vraća originalnu cenu porudžbine (pre popusta).
     *
     * @return originalna cena
     */
    public BigDecimal getOriginalnaCena() {
        return originalnaCena;
    }

    /**
     * Postavlja originalnu cenu porudžbine, zaokruženu na dve decimale (HALF_UP).
     *
     * @param originalnaCena originalna cena
     */
    public void setOriginalnaCena(BigDecimal originalnaCena) {
        this.originalnaCena = originalnaCena == null ? null : originalnaCena.setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Vraća napomenu uz porudžbinu.
     *
     * @return napomena
     */
    public String getNapomena() {
        return napomena;
    }

    /**
     * Postavlja napomenu uz porudžbinu.
     *
     * @param napomena napomena
     */
    public void setNapomena(String napomena) {
        this.napomena = napomena;
    }

    /**
     * Vraća tip porudžbine.
     *
     * @return tip porudžbine
     */
    public TipPorudzbine getTipPorudzbine() {
        return tipPorudzbine;
    }

    /**
     * Postavlja tip porudžbine.
     *
     * @param tipPorudzbine tip porudžbine
     */
    public void setTipPorudzbine(TipPorudzbine tipPorudzbine) {
        this.tipPorudzbine = tipPorudzbine;
    }

    /**
     * Vraća procenjeno vreme pripreme u minutima.
     *
     * @return procenjeno vreme u minutima
     */
    public Integer getProcenjenoVreme() {
        return procenjenoVreme;
    }

    /**
     * Postavlja procenjeno vreme pripreme u minutima.
     *
     * @param procenjenoVreme procenjeno vreme u minutima
     */
    public void setProcenjenoVreme(Integer procenjenoVreme) {
        this.procenjenoVreme = procenjenoVreme;
    }

    /**
     * Vraća korisnika koji je kreirao porudžbinu.
     *
     * @return korisnik porudžbine
     */
    public Korisnik getKorisnik() {
        return korisnik;
    }

    /**
     * Postavlja korisnika koji je kreirao porudžbinu.
     *
     * @param korisnik korisnik porudžbine
     */
    public void setKorisnik(Korisnik korisnik) {
        this.korisnik = korisnik;
    }

    /**
     * Vraća identifikator korisnika koji je kreirao porudžbinu, ili
     * {@code null} ako korisnik nije postavljen. Izvedeno polje koje se ne
     * mapira u bazu.
     *
     * @return identifikator korisnika ili {@code null}
     */
    @Transient
    public Long getKorisnikId() {
        return korisnik != null ? korisnik.getId() : null;
    }
}
