package com.glumacplus.food_ordering.model;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "radno_vreme")
public class RadnoVreme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DanUNedelji dan;

    @Column(name = "od_vremena", nullable = false)
    private LocalTime odVremena;

    @Column(name = "do_vremena", nullable = false)
    private LocalTime doVremena;

    @Column(nullable = false)
    private Boolean aktivno = true;

    public RadnoVreme() {}

    public RadnoVreme(DanUNedelji dan, LocalTime odVremena, LocalTime doVremena, Boolean aktivno) {
        this.dan = dan;
        this.odVremena = odVremena;
        this.doVremena = doVremena;
        this.aktivno = aktivno;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public DanUNedelji getDan() {
        return dan;
    }

    public void setDan(DanUNedelji dan) {
        this.dan = dan;
    }

    public LocalTime getOdVremena() {
        return odVremena;
    }

    public void setOdVremena(LocalTime odVremena) {
        this.odVremena = odVremena;
    }

    public LocalTime getDoVremena() {
        return doVremena;
    }

    public void setDoVremena(LocalTime doVremena) {
        this.doVremena = doVremena;
    }

    public Boolean getAktivno() {
        return aktivno;
    }

    public void setAktivno(Boolean aktivno) {
        this.aktivno = aktivno;
    }
}
