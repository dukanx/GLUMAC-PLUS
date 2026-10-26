package com.glumacplus.food_ordering.repository;

import com.glumacplus.food_ordering.model.Porudzbina;
import com.glumacplus.food_ordering.model.StatusPorudzbine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * {@code JpaSpecificationExecutor} je tu zbog pretrage istorije u admin panelu:
 * filteri su opcioni, a `Specification` gradi upit samo od onih koji su zadati.
 * Ranije napisan {@code @Query} sa uslovima oblika {@code (:param is null or ...)}
 * padao je na Postgresu sa „could not determine data type of parameter" — baza ne
 * može da zaključi tip parametra koji se poredi sa NULL.
 */
@Repository
public interface PorudzbinaRepository extends JpaRepository<Porudzbina, Long>, JpaSpecificationExecutor<Porudzbina> {

    Page<Porudzbina> findByKorisnik_Id(Long korisnikId, Pageable pageable);


    Page<Porudzbina> findByStatus(StatusPorudzbine status, Pageable pageable);


    List<Porudzbina> findAllByStatus(StatusPorudzbine status);

    boolean existsByKorisnik_IdAndStatusIn(Long korisnikId, List<StatusPorudzbine> statusi);

    java.util.Optional<Porudzbina> findFirstByKorisnik_IdAndStatusInOrderByIdDesc(Long korisnikId, List<StatusPorudzbine> statusi);

    /**
     * Prihod i broj porudžbina u periodu, jednim upitom.
     *
     * <p>Sabira se {@code ukupanIznos} — ono što je stvarno naplaćeno, posle
     * loyalty popusta. Razlika prema {@code originalnaCena} vraća se posebno kao
     * ukupno dat popust; gde popusta nije bilo, {@code originalnaCena} je NULL,
     * pa se u tom slučaju uzima sam iznos i razlika ispadne nula.</p>
     *
     * <p>Sabiranje je na bazi, a ne nad učitanim porudžbinama, jer broj
     * porudžbina raste zauvek — dohvatanje svih realizovanih samo da bi se
     * sabrale poskupljuje se svakog dana.</p>
     *
     * @param status status koji se broji (za promet: {@code REALIZOVANA})
     * @param od početak perioda, uključivo
     * @param doVremena kraj perioda, ISKLJUČIVO
     * @return projekcija sa prihodom, brojem i popustom; polja su {@code null} ako u periodu nema porudžbina
     */
    @Query("""
            select sum(p.ukupanIznos) as prihod,
                   count(p) as broj,
                   sum(coalesce(p.originalnaCena, p.ukupanIznos) - p.ukupanIznos) as popust
            from Porudzbina p
            where p.status = :status
              and p.datum >= :od
              and p.datum < :doVremena
            """)
    PrihodProjekcija prihodZaPeriod(@Param("status") StatusPorudzbine status,
                                    @Param("od") LocalDateTime od,
                                    @Param("doVremena") LocalDateTime doVremena);

    /**
     * Broj porudžbina po statusu u periodu — svi statusi odjednom, jednim upitom.
     *
     * @param od početak perioda, uključivo
     * @param doVremena kraj perioda, isključivo
     * @return parovi {@code [status, broj]}; statusi bez ijedne porudžbine se ne pojavljuju
     */
    @Query("""
            select p.status, count(p)
            from Porudzbina p
            where p.datum >= :od
              and p.datum < :doVremena
            group by p.status
            """)
    List<Object[]> brojPoStatusu(@Param("od") LocalDateTime od,
                                 @Param("doVremena") LocalDateTime doVremena);

    /**
     * Prihod po danima, za grafikon.
     *
     * <p>Grupiše se po {@code year/month/day}, a ne po {@code cast(... as date)},
     * da upit ostane čist JPQL — bez oslanjanja na Postgresov {@code date_trunc}.
     * Dani bez ijedne porudžbine se ne vraćaju; popunjava ih servis, inače bi
     * grafikon preskočio prazan dan i slagao o razmaku.</p>
     *
     * @param status status koji se broji
     * @param od početak perioda, uključivo
     * @param doVremena kraj perioda, isključivo
     * @return redovi {@code [godina, mesec, dan, prihod, broj]}, poređani hronološki
     */
    @Query("""
            select year(p.datum), month(p.datum), day(p.datum),
                   sum(p.ukupanIznos), count(p)
            from Porudzbina p
            where p.status = :status
              and p.datum >= :od
              and p.datum < :doVremena
            group by year(p.datum), month(p.datum), day(p.datum)
            order by year(p.datum), month(p.datum), day(p.datum)
            """)
    List<Object[]> prihodPoDanima(@Param("status") StatusPorudzbine status,
                                  @Param("od") LocalDateTime od,
                                  @Param("doVremena") LocalDateTime doVremena);

    /** Jedan red sažetka prometa; imena se poklapaju sa aliasima u upitu. */
    interface PrihodProjekcija {
        BigDecimal getPrihod();

        long getBroj();

        BigDecimal getPopust();
    }
}
