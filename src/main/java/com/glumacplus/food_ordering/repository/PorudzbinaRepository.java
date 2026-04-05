package com.glumacplus.food_ordering.repository;

import com.glumacplus.food_ordering.model.Porudzbina;
import com.glumacplus.food_ordering.model.StatusPorudzbine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PorudzbinaRepository extends JpaRepository<Porudzbina, Long> {

    Page<Porudzbina> findByKorisnikId(Long korisnikId, Pageable pageable);


    Page<Porudzbina> findByStatus(StatusPorudzbine status, Pageable pageable);


    List<Porudzbina> findAllByStatus(StatusPorudzbine status);

    @Query("""
            select coalesce(sum(p.ukupanIznos), 0), count(p)
            from Porudzbina p
            where p.status = :status
              and p.datum >= :od
              and p.datum < :doVreme
            """)
    Object[] findPrihodIBrojByStatusAndPeriod(
            @Param("status") StatusPorudzbine status,
            @Param("od") LocalDateTime od,
            @Param("doVreme") LocalDateTime doVreme
    );

    @Query("""
            select p.status, count(p)
            from Porudzbina p
            where p.datum >= :od
              and p.datum < :doVreme
            group by p.status
            """)
    List<Object[]> countPoStatusuZaPeriod(
            @Param("od") LocalDateTime od,
            @Param("doVreme") LocalDateTime doVreme
    );

}
