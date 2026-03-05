package com.glumacplus.food_ordering.service;

import com.glumacplus.food_ordering.dto.AuthenticationRequest;
import com.glumacplus.food_ordering.dto.AuthenticationResponse;
import com.glumacplus.food_ordering.dto.KorisnikMapper;
import com.glumacplus.food_ordering.dto.KorisnikViewDto;
import com.glumacplus.food_ordering.model.Korisnik;
import com.glumacplus.food_ordering.repository.KorisnikRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthenticationService {

    private final KorisnikRepository korisnikRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationService(KorisnikRepository korisnikRepository,
                                 JwtService jwtService,
                                 AuthenticationManager authenticationManager) {
        this.korisnikRepository = korisnikRepository;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }


    // LOGIN
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        // AuthenticationManager rad proveru sifre
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getLozinka()
                )
        );

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

    public KorisnikViewDto getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        Korisnik korisnik = korisnikRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Niste ulogovani"));

        return KorisnikMapper.toViewDto(korisnik);
    }
}
