package com.glumacplus.food_ordering.repository;

import com.glumacplus.food_ordering.model.Korisnik;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface KorisnikRepository extends JpaRepository<Korisnik, Long> {

    Optional<Korisnik> findByEmail(String email);

    boolean existsByEmail(String email);
}
