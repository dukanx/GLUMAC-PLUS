package com.glumacplus.food_ordering.dto;

import com.glumacplus.food_ordering.model.LoyaltyProgram;
import com.glumacplus.food_ordering.model.Uloga;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotNull;

public class KorisnikViewDto {


    private Long id;
    private String ime;
    private String email;
    private double brojBodova;
    private String loyaltyNivo;
    private Uloga uloga;

    public KorisnikViewDto(Long id, String ime, String email, double brojBodova, String loyaltyNivo, Uloga uloga) {
        this.id = id;
        this.ime = ime;
        this.email = email;
        this.brojBodova = brojBodova;
        this.loyaltyNivo = loyaltyNivo;
        this.uloga = uloga;
    }
    public KorisnikViewDto() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIme() {
        return ime;
    }

    public void setIme(String ime) {
        this.ime = ime;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public double getBrojBodova() {
        return brojBodova;
    }

    public void setBrojBodova(double brojBodova) {
        this.brojBodova = brojBodova;
    }

    public String getLoyaltyNivo() { return loyaltyNivo; }
    public void setLoyaltyNivo(String loyaltyNivo) { this.loyaltyNivo = loyaltyNivo; }

    public Uloga getUloga() { return uloga; }
    public void setUloga(Uloga uloga) { this.uloga = uloga; }
}
