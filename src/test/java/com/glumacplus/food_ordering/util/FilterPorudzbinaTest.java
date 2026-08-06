package com.glumacplus.food_ordering.util;

import com.glumacplus.food_ordering.model.StatusPorudzbine;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

/** Razlaganje filtera pretrage porudžbina — mesta na kojima se lako pogreši. */
class FilterPorudzbinaTest {

    @Test
    void brojTraziIskljucivoPorudzbinuSTimBrojem() {
        FilterPorudzbina f = FilterPorudzbina.napravi(null, null, null, "128");

        assertEquals(128L, f.brojPorudzbine());
        // Ranije se broj tražio i u e-mailu kupca, pa je „78" izbacivalo i tuđe
        // porudžbine — rezultat koji se iz tabele ne može objasniti.
        assertNull(f.pojam());
    }

    @Test
    void resetkaIspredBrojaSeZanemaruje() {
        assertEquals(128L, FilterPorudzbina.napravi(null, null, null, "#128").brojPorudzbine());
    }

    @Test
    void imeSeTrimujeINormalizuje() {
        FilterPorudzbina f = FilterPorudzbina.napravi(null, null, null, "  Milica  ");

        assertEquals("milica", f.pojam());
        assertNull(f.brojPorudzbine(), "ime nije broj porudžbine");
    }

    @Test
    void pojamGubiKvaciceIPismo() {
        assertEquals("sunka", FilterPorudzbina.napravi(null, null, null, "Šunka").pojam());
        assertEquals("sunka", FilterPorudzbina.napravi(null, null, null, "шунка").pojam());
    }

    @Test
    void prazanPojamNeSuzavaNista() {
        FilterPorudzbina f = FilterPorudzbina.napravi(null, null, null, "   ");

        assertNull(f.pojam());
        assertNull(f.brojPorudzbine());
        assertFalse(f.imaPretragu());
    }

    @Test
    void krajOpsegaObuhvataCeoPoslednjiDan() {
        FilterPorudzbina f = FilterPorudzbina.napravi(
                null, LocalDate.of(2026, 8, 1), LocalDate.of(2026, 8, 3), null);

        assertEquals(LocalDateTime.of(2026, 8, 1, 0, 0), f.od());
        // Kraj je ekskluzivan, pa mora biti početak SLEDEĆEG dana — inače bi
        // porudžbina od 3. avgusta u 14:20 ispala iz rezultata.
        assertEquals(LocalDateTime.of(2026, 8, 4, 0, 0), f.doVremena());
    }

    @Test
    void bezDatumaNemaGranica() {
        FilterPorudzbina f = FilterPorudzbina.napravi(StatusPorudzbine.NOVA, null, null, null);

        assertNull(f.od());
        assertNull(f.doVremena());
        assertEquals(StatusPorudzbine.NOVA, f.status());
    }
}
