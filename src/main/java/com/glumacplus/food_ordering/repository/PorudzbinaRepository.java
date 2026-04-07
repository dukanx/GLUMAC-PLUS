package com.glumacplus.food_ordering.repository;

import com.glumacplus.food_ordering.model.Porudzbina;
import com.glumacplus.food_ordering.model.StatusPorudzbine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PorudzbinaRepository extends JpaRepository<Porudzbina, Long> {

    Page<Porudzbina> findByKorisnik_Id(Long korisnikId, Pageable pageable);


    Page<Porudzbina> findByStatus(StatusPorudzbine status, Pageable pageable);


    List<Porudzbina> findAllByStatus(StatusPorudzbine status);


}
