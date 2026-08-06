package com.glumacplus.food_ordering.repository;

import com.glumacplus.food_ordering.model.Porudzbina;
import com.glumacplus.food_ordering.model.StatusPorudzbine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * {@code JpaSpecificationExecutor} je tu zbog pretrage istorije u admin panelu:
 * filteri su opcioni, a `Specification` gradi upit samo od onih koji su zadati.
 * Ranije napisan {@code @Query} sa uslovima oblika {@code (:param is null or ...)}
 * padao je na Postgresu sa „could not determine data type of parameter" — baza ne
 * može da zaključi tip parametra koji se poredi sa NULL.
 */
@Repository
public interface PorudzbinaRepository extends JpaRepository<Porudzbina, Long>, JpaSpecificationExecutor<Porudzbina> {

    Page<Porudzbina> findByKorisnik_Id(Long korisnikId, Pageable pageable);


    Page<Porudzbina> findByStatus(StatusPorudzbine status, Pageable pageable);


    List<Porudzbina> findAllByStatus(StatusPorudzbine status);

    boolean existsByKorisnik_IdAndStatusIn(Long korisnikId, List<StatusPorudzbine> statusi);

    java.util.Optional<Porudzbina> findFirstByKorisnik_IdAndStatusInOrderByIdDesc(Long korisnikId, List<StatusPorudzbine> statusi);


}
