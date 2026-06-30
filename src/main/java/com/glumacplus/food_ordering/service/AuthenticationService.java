package com.glumacplus.food_ordering.service;

import com.glumacplus.food_ordering.dto.AuthenticationRequest;
import com.glumacplus.food_ordering.dto.AuthenticationResponse;
import com.glumacplus.food_ordering.dto.KorisnikMapper;
import com.glumacplus.food_ordering.dto.KorisnikViewDto;
import com.glumacplus.food_ordering.model.Korisnik;
import com.glumacplus.food_ordering.repository.KorisnikRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Servis za autentifikaciju korisnika i izdavanje JWT tokena.
 *
 * @author Nikola Dukić
 * @version 1.0
 */
@Service
public class AuthenticationService {

    private final KorisnikRepository korisnikRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    /**
     * Kreira servis sa potrebnim zavisnostima.
     *
     * @param korisnikRepository repozitorijum korisnika
     * @param jwtService servis za rad sa JWT tokenima
     * @param authenticationManager Spring Security menadžer autentifikacije
     */
    public AuthenticationService(KorisnikRepository korisnikRepository,
                                 JwtService jwtService,
                                 AuthenticationManager authenticationManager) {
        this.korisnikRepository = korisnikRepository;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    /**
     * Prijavljuje korisnika na osnovu email-a i lozinke. Ako su kredencijali
     * ispravni, generiše JWT token i vraća podatke o korisniku.
     *
     * @param request zahtev sa email-om i lozinkom
     * @return odgovor sa JWT tokenom i podacima o korisniku
     * @throws ResponseStatusException sa statusom 401 ako su kredencijali pogrešni
     * @throws UsernameNotFoundException ako korisnik nije pronađen u bazi
     */
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getLozinka()
                    )
            );
        } catch (BadCredentialsException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Pogrešan email ili lozinka.");
        }

        //  Ako gornja linija nije bacila gresku,korisnik validan
        // Trazimo ga u bazi da bismo mogli da generisemo token.
        Korisnik korisnik = korisnikRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Korisnik nije nadjen"));


        //  generisanje tokena
        String jwtToken = jwtService.generateToken(new com.glumacplus.food_ordering.security.FoodOrderingUserDetails(korisnik));

        KorisnikViewDto korisnikViewDto = new KorisnikViewDto();
        korisnikViewDto = KorisnikMapper.toViewDto(korisnik);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .korisnik(korisnikViewDto)
                .build();
    }

    /**
     * Vraća podatke o trenutno prijavljenom korisniku, na osnovu
     * sigurnosnog konteksta.
     *
     * @return podaci o trenutno prijavljenom korisniku
     * @throws ResponseStatusException sa statusom 401 ako korisnik nije prijavljen
     */
    public KorisnikViewDto getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        Korisnik korisnik = korisnikRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Niste ulogovani"));

        return KorisnikMapper.toViewDto(korisnik);
    }
}
