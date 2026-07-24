package com.glumacplus.food_ordering.repository;

import com.glumacplus.food_ordering.model.SmenaStanje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SmenaStanjeRepository extends JpaRepository<SmenaStanje, Long> {
}
