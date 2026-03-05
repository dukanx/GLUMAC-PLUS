package com.glumacplus.food_ordering.service;

import com.glumacplus.food_ordering.dto.KorisnikDto;
import com.glumacplus.food_ordering.dto.KorisnikMeUpdateDto;
import com.glumacplus.food_ordering.dto.KorisnikMapper;
import com.glumacplus.food_ordering.dto.KorisnikViewDto;
import com.glumacplus.food_ordering.model.Korisnik;
import com.glumacplus.food_ordering.model.LoyaltyProgram;
import com.glumacplus.food_ordering.model.Uloga;
import com.glumacplus.food_ordering.repository.KorisnikRepository;
import com.glumacplus.food_ordering.repository.LoyaltyProgramRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class KorisnikService {

    private final PasswordEncoder passwordEncoder;

    private final KorisnikRepository korisnikRepo;
    private final LoyaltyProgramRepository loyaltyRepo;

    public KorisnikService(KorisnikRepository korisnikRepo, LoyaltyProgramRepository loyaltyRepo, PasswordEncoder passwordEncoder) {
        this.korisnikRepo = korisnikRepo;
        this.loyaltyRepo = loyaltyRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public KorisnikViewDto findByEmail(String email) {
        Korisnik k = korisnikRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ne postoji korisnik sa tim emailom"));

        return KorisnikMapper.toViewDto(k);
    }


    public List<KorisnikViewDto> getAll() {
        return korisnikRepo.findAll().stream()
                .map(KorisnikMapper::toViewDto)
                .collect(Collectors.toList());
    }


    public KorisnikViewDto getById(Long id) {
        Korisnik k = korisnikRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Korisnik nije pronađen!"));
        return KorisnikMapper.toViewDto(k);
    }


    public KorisnikViewDto create(KorisnikDto dto) {

        if (korisnikRepo.existsByEmail(dto.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Korisnik sa email-om " + dto.getEmail() + " već postoji!");
        }


        Korisnik k = new Korisnik();
        k.setIme(dto.getIme());
        k.setEmail(dto.getEmail());
        k.setLozinka(passwordEncoder.encode(dto.getLozinka()));
        k.setUloga(Uloga.KORISNIK);
        k.setBrojBodova(0);


        LoyaltyProgram pocetniNivo = loyaltyRepo.findByNivo("Nova zvezda")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Loyalty program 'Nova zvezda' ne postoji u bazi!"));

        k.setLoyaltyProgram(pocetniNivo);


        k = korisnikRepo.save(k);
        return KorisnikMapper.toViewDto(k);
    }

    public KorisnikViewDto getCurrentUser() {
        return KorisnikMapper.toViewDto(getCurrentUserEntity());
    }

    public KorisnikViewDto updateCurrentUser(KorisnikMeUpdateDto dto) {
        Korisnik korisnik = getCurrentUserEntity();
        korisnik.setIme(dto.getIme());

        if (dto.getNovaLozinka() != null && !dto.getNovaLozinka().isBlank()) {
            korisnik.setLozinka(passwordEncoder.encode(dto.getNovaLozinka()));
        }

        korisnik = korisnikRepo.save(korisnik);
        return KorisnikMapper.toViewDto(korisnik);
    }

    private Korisnik getCurrentUserEntity() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return korisnikRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Niste ulogovani"));
    }
}
