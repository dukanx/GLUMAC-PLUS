package com.glumacplus.food_ordering.repository;

import com.glumacplus.food_ordering.model.Proizvod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProizvodRepository extends JpaRepository<Proizvod, Long> {

    List<Proizvod> findByNazivContainingIgnoreCaseOrTipContainingIgnoreCase(String nazivTerm, String tipTerm);

    boolean existsByNazivAndTip(String naziv, String tip);
}
