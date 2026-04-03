package com.glumacplus.food_ordering.repository;

import com.glumacplus.food_ordering.model.Alergen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AlergenRepository extends JpaRepository<Alergen, Long> {

    Optional<Alergen> findByNaziv(String naziv);

    boolean existsByNaziv(String naziv);
}
