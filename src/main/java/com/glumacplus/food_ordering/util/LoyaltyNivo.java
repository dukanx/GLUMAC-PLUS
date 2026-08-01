package com.glumacplus.food_ordering.util;

import com.glumacplus.food_ordering.model.LoyaltyProgram;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * Pravilo po kom se iz broja bodova izvodi loyalty nivo.
 *
 * <p>Živi na jednom mestu jer ga koriste dva puta koja moraju da se slažu:
 * dodela bodova pri preuzimanju porudžbine i ručna ispravka bodova iz admin
 * panela. Da je pravilo prepisano na oba mesta, ispravka bi vremenom počela da
 * daje drugačiji nivo od poručivanja.</p>
 *
 * @author Nikola Dukić
 * @version 1.0
 */
public final class LoyaltyNivo {

    private LoyaltyNivo() {}

    /**
     * Vraća najviši nivo čiji je prag dostignut zadatim brojem bodova.
     *
     * @param sviNivoi svi definisani loyalty nivoi
     * @param bodovi broj bodova korisnika
     * @return nivo koji pripada tom broju bodova, ili prazno ako bodovi ne
     *         dostižu ni najniži prag
     */
    public static Optional<LoyaltyProgram> odredi(List<LoyaltyProgram> sviNivoi, double bodovi) {
        return sviNivoi.stream()
                .filter(nivo -> bodovi >= nivo.getPragBodova())
                .max(Comparator.comparing(LoyaltyProgram::getPragBodova));
    }
}
