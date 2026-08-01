package com.glumacplus.food_ordering.repository;

import com.glumacplus.food_ordering.model.Korisnik;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;

import java.util.List;
import java.util.Optional;

public interface KorisnikRepository extends JpaRepository<Korisnik, Long> {

    /**
     * Lista korisnika za admin panel, sa loyalty programom u istom upitu.
     *
     * <p>{@code loyaltyProgram} je {@code @ManyToOne} bez {@code fetch}, dakle
     * EAGER, pa ga Hibernate bez ovoga dohvata zasebnim upitom po <em>različitom</em>
     * programu (mereno: 3 upita umesto 1). Nije N+1 koji raste sa brojem korisnika —
     * program se keširа u persistence contextu — ali su to suvišna mrežna
     * putovanja na svaki poziv, jer svaki HTTP zahtev dobija nov context.</p>
     */
    @Override
    @EntityGraph(attributePaths = "loyaltyProgram")
    @NonNull
    List<Korisnik> findAll();

    /**
     * <p>{@code @EntityGraph} iz istog razloga kao gore, ali ovde je uzrok manje
     * očigledan: {@code findById} ide preko {@code EntityManager.find()}, koji
     * EAGER {@code @ManyToOne} spaja u isti {@code SELECT}. Izvedeni upit kao
     * ovaj to ne radi — vraća korisnika pa tek onda zasebnim upitom njegov
     * loyalty program. Pogađa i prijavu, koja korisnika traži baš po e-mailu.</p>
     */
    @EntityGraph(attributePaths = "loyaltyProgram")
    Optional<Korisnik> findByEmail(String email);

    boolean existsByEmail(String email);
}
