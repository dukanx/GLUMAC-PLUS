package com.glumacplus.food_ordering.repository;

import com.glumacplus.food_ordering.model.Proizvod;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProizvodRepository extends JpaRepository<Proizvod, Long> {

    List<Proizvod> findByTip(String tip);

    Page<Proizvod> findByNazivContainingIgnoreCase(String naziv, Pageable pageable);
}
