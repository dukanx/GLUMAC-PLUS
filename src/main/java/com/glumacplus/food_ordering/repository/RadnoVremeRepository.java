package com.glumacplus.food_ordering.repository;

import com.glumacplus.food_ordering.model.DanUNedelji;
import com.glumacplus.food_ordering.model.RadnoVreme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RadnoVremeRepository extends JpaRepository<RadnoVreme, Long> {

    List<RadnoVreme> findByAktivno(Boolean aktivno);

    Optional<RadnoVreme> findByDan(DanUNedelji dan);

    List<RadnoVreme> findByDanAndAktivno(DanUNedelji dan, Boolean aktivno);
}
