package com.glumacplus.food_ordering.repository;

import com.glumacplus.food_ordering.model.LoyaltyProgram;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LoyaltyProgramRepository extends JpaRepository<LoyaltyProgram, Long> {

    Optional<LoyaltyProgram> findByNivo(String nivo);
}

