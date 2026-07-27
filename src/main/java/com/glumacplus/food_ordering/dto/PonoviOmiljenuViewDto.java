package com.glumacplus.food_ordering.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * Odgovor na ponavljanje omiljene porudžbine.
 *
 * <p>Pored kreirane porudžbine nosi i nazive stavki/dodataka koji su
 * preskočeni jer u tom trenutku nisu bili dostupni. Frontend zna dostupnost
 * samo od učitavanja strane, pa je ovo jedini pouzdan izvor — server je taj
 * koji odlučuje šta je stvarno ušlo u porudžbinu.</p>
 */
public class PonoviOmiljenuViewDto {

    private PorudzbinaViewDto porudzbina;
    private List<String> preskoceno = new ArrayList<>();

    public PonoviOmiljenuViewDto() {}

    public PonoviOmiljenuViewDto(PorudzbinaViewDto porudzbina, List<String> preskoceno) {
        this.porudzbina = porudzbina;
        setPreskoceno(preskoceno);
    }

    public PorudzbinaViewDto getPorudzbina() {
        return porudzbina;
    }

    public void setPorudzbina(PorudzbinaViewDto porudzbina) {
        this.porudzbina = porudzbina;
    }

    public List<String> getPreskoceno() {
        return preskoceno;
    }

    public void setPreskoceno(List<String> preskoceno) {
        this.preskoceno = preskoceno == null ? new ArrayList<>() : preskoceno;
    }
}
