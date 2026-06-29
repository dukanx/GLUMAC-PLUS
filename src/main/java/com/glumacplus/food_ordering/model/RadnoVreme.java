package com.glumacplus.food_ordering.model;

import jakarta.persistence.*;
import java.time.LocalTime;

/**
 * Predstavlja radno vreme restorana za jedan dan u nedelji.
 *
 * <p>Definiše interval (od–do) tokom kog je restoran otvoren za dati dan i
 * oznaku da li je taj interval aktivan.</p>
 *
 * @author Nikola Dukić
 * @version 1.0
 */
@Entity
@Table(name = "radno_vreme")
public class RadnoVreme {

    /** Jedinstveni identifikator radnog vremena. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Dan u nedelji na koji se radno vreme odnosi. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DanUNedelji dan;

    /** Vreme početka radnog vremena. */
    @Column(name = "od_vremena", nullable = false)
    private LocalTime odVremena;

    /** Vreme kraja radnog vremena. */
    @Column(name = "do_vremena", nullable = false)
    private LocalTime doVremena;

    /** Oznaka da li je radno vreme aktivno. */
    @Column(nullable = false)
    private Boolean aktivno = true;

    /**
     * Podrazumevani konstruktor.
     */
    public RadnoVreme() {}

    /**
     * Kreira radno vreme sa zadatim podacima.
     *
     * @param dan dan u nedelji
     * @param odVremena vreme početka
     * @param doVremena vreme kraja
     * @param aktivno oznaka aktivnosti
     */
    public RadnoVreme(DanUNedelji dan, LocalTime odVremena, LocalTime doVremena, Boolean aktivno) {
        this.dan = dan;
        this.odVremena = odVremena;
        this.doVremena = doVremena;
        this.aktivno = aktivno;
    }

    /**
     * Vraća identifikator radnog vremena.
     *
     * @return identifikator
     */
    public Long getId() {
        return id;
    }

    /**
     * Postavlja identifikator radnog vremena.
     *
     * @param id identifikator
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Vraća dan u nedelji.
     *
     * @return dan u nedelji
     */
    public DanUNedelji getDan() {
        return dan;
    }

    /**
     * Postavlja dan u nedelji.
     *
     * @param dan dan u nedelji
     */
    public void setDan(DanUNedelji dan) {
        this.dan = dan;
    }

    /**
     * Vraća vreme početka radnog vremena.
     *
     * @return vreme početka
     */
    public LocalTime getOdVremena() {
        return odVremena;
    }

    /**
     * Postavlja vreme početka radnog vremena.
     *
     * @param odVremena vreme početka
     */
    public void setOdVremena(LocalTime odVremena) {
        this.odVremena = odVremena;
    }

    /**
     * Vraća vreme kraja radnog vremena.
     *
     * @return vreme kraja
     */
    public LocalTime getDoVremena() {
        return doVremena;
    }

    /**
     * Postavlja vreme kraja radnog vremena.
     *
     * @param doVremena vreme kraja
     */
    public void setDoVremena(LocalTime doVremena) {
        this.doVremena = doVremena;
    }

    /**
     * Vraća oznaku da li je radno vreme aktivno.
     *
     * @return {@code true} ako je aktivno, inače {@code false}
     */
    public Boolean getAktivno() {
        return aktivno;
    }

    /**
     * Postavlja oznaku da li je radno vreme aktivno.
     *
     * @param aktivno oznaka aktivnosti
     */
    public void setAktivno(Boolean aktivno) {
        this.aktivno = aktivno;
    }
}
