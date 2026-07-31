package com.glumacplus.food_ordering.dto;

import com.glumacplus.food_ordering.model.Korisnik;
import com.glumacplus.food_ordering.model.Porudzbina;
import com.glumacplus.food_ordering.model.Proizvod;
import com.glumacplus.food_ordering.model.StavkaPorudzbine;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class PorudzbinaMapperTest {

    private Porudzbina porudzbinaSaStavkom() {
        Proizvod p = new Proizvod();
        p.setNaziv("Šunka kačkavalj");
        p.setCena(new BigDecimal("590"));

        StavkaPorudzbine s = new StavkaPorudzbine();
        s.setProizvod(p);
        s.setKolicina(1);
        s.setCena(new BigDecimal("590"));

        Porudzbina por = new Porudzbina();
        por.dodajStavku(s);
        return por;
    }

    /** Panel prikazuje čija je porudžbina — ime mora da prođe kroz DTO. */
    @Test
    void testMapiraImeKupca() {
        Korisnik kupac = new Korisnik();
        kupac.setIme("Marko Marković");

        Porudzbina por = porudzbinaSaStavkom();
        por.setKorisnik(kupac);

        assertEquals("Marko Marković", PorudzbinaMapper.toViewDto(por).getKorisnikIme());
    }

    /**
     * Porudžbina bez korisnika ne sme da obori mapiranje — panel tada samo ne
     * prikaže red sa imenom. Setter doduše ne dozvoljava null, ali kolona
     * {@code korisnik_id} jeste nullable, a Hibernate puni polja direktno,
     * zaobilazeći setter.
     */
    @Test
    void testBezKorisnikaNePuca() {
        Porudzbina por = porudzbinaSaStavkom();

        PorudzbinaViewDto dto = assertDoesNotThrow(() -> PorudzbinaMapper.toViewDto(por));
        assertNull(dto.getKorisnikIme());
        assertEquals(1, dto.getStavke().size());
    }
}
