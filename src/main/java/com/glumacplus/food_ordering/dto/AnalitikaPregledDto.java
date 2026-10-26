package com.glumacplus.food_ordering.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Sve što sekcija „Pregled" u admin panelu prikazuje za izabrani period,
 * u jednom odgovoru.
 *
 * <p>Namerno jedan DTO, a ne četiri endpointa: baza je Neon u Frankfurtu i
 * jedno mrežno putovanje košta ~50 ms, pa bi četiri poziva sa strane pregledača
 * značila četiri čekanja pre nego što se stranica sklopi. Ovako se plati jedno.</p>
 *
 * @param prihod ukupno naplaćeno u periodu (samo realizovane porudžbine)
 * @param brojPorudzbina broj realizovanih porudžbina
 * @param prosecnaKorpa prihod podeljen brojem porudžbina; nula ako nema porudžbina
 * @param popust ukupno dat loyalty popust u periodu
 * @param statusi raspodela svih porudžbina iz perioda po statusu
 * @param topProizvodi najprodavaniji proizvodi, poređani po broju komada
 * @param poDanima prihod po danu, sa danima bez prometa uključenim kao nule
 */
public record AnalitikaPregledDto(
        BigDecimal prihod,
        long brojPorudzbina,
        BigDecimal prosecnaKorpa,
        BigDecimal popust,
        Statusi statusi,
        List<TopProizvod> topProizvodi,
        List<Dan> poDanima
) {

    /**
     * Koliko je porudžbina iz perioda u kom stanju.
     *
     * @param nova nove, još neprihvaćene
     * @param uPripremi prihvaćene, u pripremi
     * @param spremna spremne za preuzimanje
     * @param realizovana preuzete
     * @param otkazana otkazane
     * @param ukupno zbir svih pet
     */
    public record Statusi(long nova, long uPripremi, long spremna,
                          long realizovana, long otkazana, long ukupno) {}

    /**
     * Jedan proizvod u zbiru prodaje. Obuhvata i prodaju kao dodatak na tuđu
     * stavku, pa je „komada" stvaran broj prodatih komada, ma kako naručeni.
     *
     * @param proizvodId identifikator proizvoda
     * @param naziv naziv proizvoda
     * @param komada ukupno prodato komada
     * @param promet novac zarađen na tom proizvodu, bez popusta na nivou porudžbine
     */
    public record TopProizvod(Long proizvodId, String naziv, double komada, BigDecimal promet) {}

    /**
     * Jedan dan na grafikonu.
     *
     * @param dan datum
     * @param prihod naplaćeno tog dana
     * @param brojPorudzbina broj realizovanih porudžbina tog dana
     */
    public record Dan(LocalDate dan, BigDecimal prihod, long brojPorudzbina) {}
}
