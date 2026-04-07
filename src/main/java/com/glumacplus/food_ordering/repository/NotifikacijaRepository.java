package com.glumacplus.food_ordering.repository;

import com.glumacplus.food_ordering.model.Notifikacija;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotifikacijaRepository extends JpaRepository<Notifikacija, Long> {

    Page<Notifikacija> findByKorisnikIdOrderByDatumDesc(Long korisnikId, Pageable pageable);

    Page<Notifikacija> findByKorisnikIdAndProcitanaOrderByDatumDesc(Long korisnikId, Boolean procitana, Pageable pageable);

    Optional<Notifikacija> findByIdAndKorisnikId(Long id, Long korisnikId);

    long countByKorisnikIdAndProcitana(Long korisnikId, Boolean procitana);

    @Modifying
    @Query("update Notifikacija n set n.procitana = true where n.korisnik.id = :korisnikId and n.procitana = false")
    int markAllAsReadByKorisnikId(@Param("korisnikId") Long korisnikId);
}
