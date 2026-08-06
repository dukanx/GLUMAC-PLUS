package com.glumacplus.food_ordering.util;

import java.text.Normalizer;
import java.util.Map;

/**
 * Poređenje teksta koje ne mari za kvačice ni za pismo.
 *
 * <p>Isto pravilo koje frontend ima u {@code utils/tekst.ts} — mora da bude
 * isto, inače bi pretraga u meniju i pretraga u admin panelu davale različite
 * rezultate za isti pojam.</p>
 *
 * <p>Zašto ne u SQL-u: {@code lower()} hvata samo velika i mala slova.
 * Postgresov {@code unaccent} bi skinuo kvačice, ali ne zna za ćirilicu i
 * prevodi <b>đ</b> u „d" umesto u „dj", pa se ne bi poklopio sa ovim pravilom.
 * Dok su šifarnici mali (nekoliko korisnika, ~180 proizvoda), jeftinije je i
 * tačnije normalizovati u Javi nego uvoditi normalizovan stubac u bazi.</p>
 *
 * @author Nikola Dukić
 * @version 1.0
 */
public final class Tekst {

    private Tekst() {}

    /**
     * Srpska ćirilica → latinica bez kvačica, da bi „шунка" i „sunka" bili isti
     * pojam. Digrafi (љ→lj, њ→nj, џ→dz, ђ→dj) daju isto što i latinična reč
     * posle skidanja kvačica, pa se poklapa u oba smera.
     */
    private static final Map<Character, String> CIRILICA = Map.ofEntries(
            Map.entry('а', "a"), Map.entry('б', "b"), Map.entry('в', "v"), Map.entry('г', "g"),
            Map.entry('д', "d"), Map.entry('ђ', "dj"), Map.entry('е', "e"), Map.entry('ж', "z"),
            Map.entry('з', "z"), Map.entry('и', "i"), Map.entry('ј', "j"), Map.entry('к', "k"),
            Map.entry('л', "l"), Map.entry('љ', "lj"), Map.entry('м', "m"), Map.entry('н', "n"),
            Map.entry('њ', "nj"), Map.entry('о', "o"), Map.entry('п', "p"), Map.entry('р', "r"),
            Map.entry('с', "s"), Map.entry('т', "t"), Map.entry('ћ', "c"), Map.entry('у', "u"),
            Map.entry('ф', "f"), Map.entry('х', "h"), Map.entry('ц', "c"), Map.entry('ч', "c"),
            Map.entry('џ', "dz"), Map.entry('ш', "s")
    );

    /**
     * Svodi tekst na mala latinična slova bez dijakritike.
     *
     * <p>NFD razlaže ć/č/š/ž na osnovno slovo i kombinujući znak, pa se znak
     * obriše. Slovo <b>đ</b> tako ne radi — ono je zaseban glif (U+0111), NFD ga
     * ne dira, zato ide ručno. Prevodi se u „dj", ne u „d", jer tako i inače
     * kucamo bez kvačica (djubre, Djordje).</p>
     *
     * @param tekst ulazni tekst; sme biti {@code null}
     * @return normalizovan tekst, ili prazan string ako je ulaz {@code null}
     */
    public static String normalizuj(String tekst) {
        if (tekst == null) return "";

        String malo = tekst.toLowerCase();

        StringBuilder sb = new StringBuilder(malo.length());
        for (char c : malo.toCharArray()) {
            String zamena = CIRILICA.get(c);
            sb.append(zamena != null ? zamena : c);
        }

        return Normalizer.normalize(sb.toString(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace("đ", "dj");
    }

    /**
     * Da li normalizovani {@code tekst} sadrži normalizovani {@code pojam}.
     *
     * @param tekst tekst u kom se traži
     * @param pojam traženi pojam
     * @return {@code true} ako sadrži, ili ako je pojam prazan
     */
    public static boolean sadrzi(String tekst, String pojam) {
        String p = normalizuj(pojam).trim();
        return p.isEmpty() || normalizuj(tekst).contains(p);
    }
}
