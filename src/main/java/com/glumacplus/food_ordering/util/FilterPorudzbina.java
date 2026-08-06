package com.glumacplus.food_ordering.util;

import com.glumacplus.food_ordering.model.StatusPorudzbine;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Filteri pretrage istorije porudžbina, prevedeni iz onoga što stiže sa
 * frontenda u ono što razume upit.
 *
 * <p>Izdvojeno iz servisa da bi se moglo ispitati kao čista funkcija —
 * razlaganje pojma i granice opsega su mesta gde se greši, a kroz `Specification`
 * se teško proveravaju.</p>
 *
 * @param status filter po statusu, ili {@code null} za sve
 * @param od početak opsega, uključivo, ili {@code null}
 * @param doVremena kraj opsega, ISKLJUČIVO, ili {@code null}
 * @param brojPorudzbine pojam pročitan kao broj porudžbine, ili {@code null}
 * @param pojam normalizovan tekstualni pojam (kupac ili proizvod), ili {@code null}
 *
 * @author Nikola Dukić
 * @version 1.0
 */
public record FilterPorudzbina(StatusPorudzbine status, LocalDateTime od, LocalDateTime doVremena,
                               Long brojPorudzbine, String pojam) {

    /**
     * Razlaže ono što je vlasnik ukucao.
     *
     * <p>Pojam koji je <b>ceo broj</b> traži isključivo porudžbinu s tim brojem.
     * Ranije se broj tražio i u imenu i e-mailu kupca, pa je „78" izbacivalo i
     * porudžbinu kupca čiji e-mail sadrži 78 — rezultat koji niko nije tražio i
     * koji se iz tabele ne može objasniti.</p>
     *
     * @param status filter po statusu, ili {@code null}
     * @param od prvi dan opsega uključivo, ili {@code null}
     * @param doDatuma poslednji dan opsega UKLJUČIVO, ili {@code null}
     * @param unos ono što je ukucano u polje za pretragu
     * @return razloženi filteri
     */
    public static FilterPorudzbina napravi(StatusPorudzbine status, LocalDate od, LocalDate doDatuma, String unos) {
        String ociscen = (unos == null || unos.isBlank()) ? null : unos.trim();

        Long broj = null;
        String pojam = null;
        if (ociscen != null) {
            String bezResetke = ociscen.startsWith("#") ? ociscen.substring(1).trim() : ociscen;
            if (bezResetke.matches("\\d{1,18}")) {
                broj = Long.parseLong(bezResetke);
            } else {
                pojam = Tekst.normalizuj(ociscen).trim();
                if (pojam.isEmpty()) pojam = null;
            }
        }

        // Kraj opsega je ekskluzivan, pa se pomera na početak SLEDEĆEG dana;
        // inače bi porudžbina od 16:45 poslednjeg dana ispala iz rezultata.
        return new FilterPorudzbina(
                status,
                od == null ? null : od.atStartOfDay(),
                doDatuma == null ? null : doDatuma.plusDays(1).atStartOfDay(),
                broj,
                pojam
        );
    }

    /** Da li se uopšte traži po nečemu što nije datum ili status. */
    public boolean imaPretragu() {
        return brojPorudzbine != null || pojam != null;
    }
}
