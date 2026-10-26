package com.glumacplus.food_ordering.repository;

import com.glumacplus.food_ordering.model.Proizvod;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProizvodRepository extends JpaRepository<Proizvod, Long> {

    @Override
    @EntityGraph(attributePaths = "alergeni")
    @NonNull
    List<Proizvod> findAll();

    @EntityGraph(attributePaths = "alergeni")
    @NonNull
    List<Proizvod> findByNazivContainingIgnoreCaseOrTipContainingIgnoreCase(
        @NonNull String nazivTerm,
        @NonNull String tipTerm
    );

    boolean existsByNazivAndTip(@NonNull String naziv, @NonNull String tip);
}
