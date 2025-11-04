package com.glumacplus.food_ordering.repository;

import com.glumacplus.food_ordering.model.Porudzbina;
import com.glumacplus.food_ordering.model.StatusPorudzbine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PorudzbinaRepository extends JpaRepository<Porudzbina, Long> {

    Page<Porudzbina> findByKorisnikId(Long korisnikId, Pageable pageable);

    Page<Porudzbina> findByStatus(StatusPorudzbine status, Pageable pageable);
}
