package com.glumacplus.food_ordering.repository;

import com.glumacplus.food_ordering.model.Proizvod;
import com.glumacplus.food_ordering.model.RazlogNedostupnosti;
import com.glumacplus.food_ordering.model.Ukus;
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
    List<Proizvod> findByNazivContainingIgnoreCaseOrTipContainingIgnoreCase(String nazivTerm, String tipTerm);

    boolean existsByNazivAndTip(String naziv, String tip);

    List<Proizvod> findAllByNedostupanRazlog(RazlogNedostupnosti razlog);

    /**
     * Dostupni dodaci zadatog ukusa (za konfigurator uz palačinku).
     * {@code @EntityGraph} povlači alergene u istom upitu — bez toga mapper
     * lazy-učitava alergene za svaki dodatak posebno (N+1 upita).
     */
    @EntityGraph(attributePaths = "alergeni")
    List<Proizvod> findByTipAndUkusAndDostupanTrueOrderByNazivAsc(String tip, Ukus ukus);

    /** Svi dostupni dodaci (kad ukus nije poznat/bitan). */
    @EntityGraph(attributePaths = "alergeni")
    List<Proizvod> findByTipAndDostupanTrueOrderByNazivAsc(String tip);
}
