package com.glumacplus.food_ordering.repository;

import com.glumacplus.food_ordering.model.StatusPorudzbine;
import com.glumacplus.food_ordering.model.StavkaPorudzbine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface StavkaPorudzbineRepository extends JpaRepository<StavkaPorudzbine, Long> {

    List<StavkaPorudzbine> findByPorudzbinaId(Long porudzbinaId);

    /**
     * Koliko je čega prodato u periodu, gledano po samim stavkama.
     *
     * <p>Promet je {@code kolicina * cena}, <b>bez dodataka</b>. Ne sabira se
     * {@code iznosStavke} jer on u sebi već nosi i dodatke — tako bi novac od
     * eurokrema pripisan palačinci, a eurokrem se nigde ne bi video.</p>
     *
     * @param status status porudžbine koji se broji (za promet: {@code REALIZOVANA})
     * @param od početak perioda, uključivo
     * @param doVremena kraj perioda, isključivo
     * @return promet po proizvodu, nesortirano (redosled određuje servis)
     */
    @Query("""
            select s.proizvod.id as proizvodId,
                   s.proizvod.naziv as naziv,
                   sum(s.kolicina) as komada,
                   sum(s.kolicina * s.cena) as promet
            from StavkaPorudzbine s
            where s.porudzbina.status = :status
              and s.porudzbina.datum >= :od
              and s.porudzbina.datum < :doVremena
            group by s.proizvod.id, s.proizvod.naziv
            """)
    List<PrometProjekcija> prometPoProizvodima(@Param("status") StatusPorudzbine status,
                                               @Param("od") LocalDateTime od,
                                               @Param("doVremena") LocalDateTime doVremena);

    /**
     * Isto to, ali za ono što je prodato <b>kao dodatak</b> na tuđu stavku.
     *
     * <p>Dodatak je i sam proizvod, pa mora da uđe u zbir — inače „Eurokrem
     * Takovo" izgleda kao da se slabo prodaje samo zato što se najčešće naručuje
     * uz palačinku. Količina se množi dvaput ({@code d.kolicina * s.kolicina})
     * jer dva dodatka na tri palačinke znače šest komada.</p>
     *
     * <p>Upit stoji ovde, a ne u zasebnom repozitorijumu, jer {@code StavkaDodatak}
     * nije samostalan pojam — ne postoji bez stavke na kojoj visi.</p>
     *
     * <p>Zbir ova dva upita tačno daje osnovicu: {@code iznosStavke} je po
     * definiciji {@code kolicina * (cena + zbir dodataka)}.</p>
     *
     * @param status status porudžbine koji se broji
     * @param od početak perioda, uključivo
     * @param doVremena kraj perioda, isključivo
     * @return promet po proizvodu prodatom kao dodatak, nesortirano
     */
    @Query("""
            select d.proizvod.id as proizvodId,
                   d.proizvod.naziv as naziv,
                   sum(d.kolicina * s.kolicina) as komada,
                   sum(d.kolicina * s.kolicina * d.cena) as promet
            from StavkaDodatak d
            join d.stavka s
            where s.porudzbina.status = :status
              and s.porudzbina.datum >= :od
              and s.porudzbina.datum < :doVremena
            group by d.proizvod.id, d.proizvod.naziv
            """)
    List<PrometProjekcija> prometPoDodacima(@Param("status") StatusPorudzbine status,
                                            @Param("od") LocalDateTime od,
                                            @Param("doVremena") LocalDateTime doVremena);

    /** Jedan proizvod u zbiru prodaje; imena se poklapaju sa aliasima u upitu. */
    interface PrometProjekcija {
        Long getProizvodId();

        String getNaziv();

        Double getKomada();

        BigDecimal getPromet();
    }
}
