package com.glumacplus.food_ordering.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;


@Builder
public class AuthenticationResponse {
    private String token;
    private KorisnikViewDto korisnik;

    public AuthenticationResponse() {}

    public AuthenticationResponse(String token, KorisnikViewDto korisnik) {
        this.token = token;
        this.korisnik = korisnik;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public KorisnikViewDto getKorisnik() {
        return korisnik;
    }

    public void setKorisnik(KorisnikViewDto korisnik) {
        this.korisnik = korisnik;
    }
}