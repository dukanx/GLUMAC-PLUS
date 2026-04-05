package com.glumacplus.food_ordering.repository;

import com.glumacplus.food_ordering.model.StatusPorudzbine;
import com.glumacplus.food_ordering.model.StavkaPorudzbine;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface StavkaPorudzbineRepository extends JpaRepository<StavkaPorudzbine, Long> {

    List<StavkaPorudzbine> findByPorudzbinaId(Long porudzbinaId);

    @Query("""
            select s.proizvod.id as proizvodId,
                   s.proizvod.naziv as nazivProizvoda,
                   sum(s.kolicina) as ukupnoKomada,
                   sum(s.iznosStavke) as ukupanPromet
            from StavkaPorudzbine s
            where s.porudzbina.status = :status
              and s.porudzbina.datum >= :od
              and s.porudzbina.datum < :doVreme
            group by s.proizvod.id, s.proizvod.naziv
            order by sum(s.kolicina) desc, sum(s.iznosStavke) desc
            """)
    List<TopProizvodProjection> findTopProizvodiZaPeriod(
            @Param("status") StatusPorudzbine status,
            @Param("od") LocalDateTime od,
            @Param("doVreme") LocalDateTime doVreme,
            Pageable pageable
    );

    interface TopProizvodProjection {
        Long getProizvodId();

        String getNazivProizvoda();

        Double getUkupnoKomada();

        Double getUkupanPromet();
    }
}
