package com.glumacplus.food_ordering.repository;

import com.glumacplus.food_ordering.model.OmiljenaPorudzbina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OmiljenaPorudzbinaRepository extends JpaRepository<OmiljenaPorudzbina, Long> {

    List<OmiljenaPorudzbina> findByKorisnikIdOrderByIdDesc(Long korisnikId);

    Optional<OmiljenaPorudzbina> findByIdAndKorisnikId(Long id, Long korisnikId);
}
