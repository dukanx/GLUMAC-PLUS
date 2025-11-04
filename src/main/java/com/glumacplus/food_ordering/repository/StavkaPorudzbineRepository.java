package com.glumacplus.food_ordering.repository;

import com.glumacplus.food_ordering.model.StavkaPorudzbine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StavkaPorudzbineRepository extends JpaRepository<StavkaPorudzbine, Long> {

    List<StavkaPorudzbine> findByPorudzbinaId(Long porudzbinaId);
}
