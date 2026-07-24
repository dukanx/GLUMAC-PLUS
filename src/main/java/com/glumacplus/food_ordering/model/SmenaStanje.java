package com.glumacplus.food_ordering.model;

import jakarta.persistence.*;

/**
 * Živo stanje smene (jedan red, id=1). Kad je {@code pauzirano == true},
 * porudžbine se ne primaju ni unutar radnog vremena (ručno zaustavljanje
 * od strane zaposlenog). Automatsko otvaranje po radnom vremenu skida pauzu.
 *
 * @author Nikola Dukić
 * @version 1.0
 */
@Entity
@Table(name = "smena_stanje")
public class SmenaStanje {

    @Id
    private Long id;

    @Column(nullable = false)
    private boolean pauzirano = false;

    public SmenaStanje() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public boolean isPauzirano() { return pauzirano; }
    public void setPauzirano(boolean pauzirano) { this.pauzirano = pauzirano; }
}
