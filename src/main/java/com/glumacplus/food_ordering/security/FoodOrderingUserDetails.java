package com.glumacplus.food_ordering.security;

import com.glumacplus.food_ordering.model.Korisnik;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class FoodOrderingUserDetails implements UserDetails {

    private final Korisnik korisnik;

    public FoodOrderingUserDetails(Korisnik korisnik) {
        this.korisnik = korisnik;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + korisnik.getUloga().name()));
    }

    @Override
    public String getPassword() {
        return korisnik.getLozinka();
    }

    @Override
    public String getUsername() {
        return korisnik.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    /**
     * Blokiran nalog Spring Security odbija pri prijavi ({@code DisabledException}).
     * Za već izdate tokene ovo nije dovoljno — {@code JwtAuthenticationFilter}
     * sam gradi authentication token, pa proveru mora da uradi izričito.
     */
    @Override
    public boolean isEnabled() { return !korisnik.isBlokiran(); }


    public Korisnik getKorisnik() {
        return korisnik;
    }
}