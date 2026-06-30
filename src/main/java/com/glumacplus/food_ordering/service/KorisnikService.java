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

/**
 * Servis za upravljanje korisnicima: registracija, pregled, izmena podataka i uloga.
 *
 * @author Nikola Dukić
 * @version 1.0
 */
@Service
public class KorisnikService {

    private final PasswordEncoder passwordEncoder;

    private final KorisnikRepository korisnikRepo;
    private final LoyaltyProgramRepository loyaltyRepo;

    /**
     * Kreira servis sa potrebnim zavisnostima.
     *
     * @param korisnikRepo repozitorijum korisnika
     * @param loyaltyRepo repozitorijum loyalty programa
     * @param passwordEncoder enkoder za heširanje lozinki
     */
    public KorisnikService(KorisnikRepository korisnikRepo, LoyaltyProgramRepository loyaltyRepo, PasswordEncoder passwordEncoder) {
        this.korisnikRepo = korisnikRepo;
        this.loyaltyRepo = loyaltyRepo;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Vraća korisnika po email-u.
     *
     * @param email email korisnika
     * @return pronađeni korisnik
     * @throws ResponseStatusException sa statusom 404 ako korisnik ne postoji
     */
    public KorisnikViewDto findByEmail(String email) {
        Korisnik k = korisnikRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ne postoji korisnik sa tim emailom"));

        return KorisnikMapper.toViewDto(k);
    }

    /**
     * Vraća sve korisnike.
     *
     * @return lista svih korisnika
     */
    public List<KorisnikViewDto> getAll() {
        return korisnikRepo.findAll().stream()
                .map(KorisnikMapper::toViewDto)
                .collect(Collectors.toList());
    }

    /**
     * Vraća korisnika po identifikatoru.
     *
     * @param id identifikator korisnika
     * @return pronađeni korisnik
     * @throws ResponseStatusException sa statusom 404 ako korisnik ne postoji
     */
    public KorisnikViewDto getById(Long id) {
        Korisnik k = korisnikRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Korisnik nije pronađen!"));
        return KorisnikMapper.toViewDto(k);
    }

    /**
     * Registruje novog korisnika. Lozinka se hešira, dodeljuje se uloga
     * {@link Uloga#KORISNIK}, početni broj bodova 0 i početni loyalty nivo
     * "Nova zvezda".
     *
     * @param dto podaci o novom korisniku
     * @return kreirani korisnik
     * @throws ResponseStatusException sa statusom 400 ako email već postoji,
     *         ili 500 ako početni loyalty nivo ne postoji u bazi
     */
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

    /**
     * Vraća podatke o trenutno prijavljenom korisniku.
     *
     * @return podaci o trenutno prijavljenom korisniku
     * @throws ResponseStatusException sa statusom 401 ako korisnik nije prijavljen
     */
    public KorisnikViewDto getCurrentUser() {
        return KorisnikMapper.toViewDto(getCurrentUserEntity());
    }

    /**
     * Ažurira podatke trenutno prijavljenog korisnika (ime i opciono lozinku).
     *
     * @param dto novi podaci korisnika
     * @return ažurirani korisnik
     * @throws ResponseStatusException sa statusom 401 ako korisnik nije prijavljen
     */
    public KorisnikViewDto updateCurrentUser(KorisnikMeUpdateDto dto) {
        Korisnik korisnik = getCurrentUserEntity();
        korisnik.setIme(dto.getIme());

        if (dto.getNovaLozinka() != null && !dto.getNovaLozinka().isBlank()) {
            korisnik.setLozinka(passwordEncoder.encode(dto.getNovaLozinka()));
        }

        korisnik = korisnikRepo.save(korisnik);
        return KorisnikMapper.toViewDto(korisnik);
    }

    /**
     * Menja ulogu korisnika. Administrator ne može sebi promeniti ulogu sa
     * {@link Uloga#ADMIN} na drugu ulogu.
     *
     * @param korisnikId identifikator korisnika kome se menja uloga
     * @param novaUloga nova uloga
     * @return ažurirani korisnik
     * @throws ResponseStatusException sa statusom 400 ako je uloga {@code null}
     *         ili ako admin pokuša da sebi skine ADMIN ulogu, odnosno 404 ako
     *         korisnik ne postoji
     */
    public KorisnikViewDto updateUserRole(Long korisnikId, Uloga novaUloga) {
        if (novaUloga == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nova uloga je obavezna");
        }

        Korisnik admin = getCurrentUserEntity();
        Korisnik korisnik = korisnikRepo.findById(korisnikId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Korisnik nije pronađen!"));

        if (admin.getId().equals(korisnik.getId()) && novaUloga != Uloga.ADMIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ne možete promeniti sopstvenu ulogu sa ADMIN na drugu ulogu");
        }

        korisnik.setUloga(novaUloga);
        korisnik = korisnikRepo.save(korisnik);
        return KorisnikMapper.toViewDto(korisnik);
    }

    /**
     * Vraća entitet trenutno prijavljenog korisnika na osnovu sigurnosnog
     * konteksta.
     *
     * @return entitet trenutno prijavljenog korisnika
     * @throws ResponseStatusException sa statusom 401 ako korisnik nije prijavljen
     */
    private Korisnik getCurrentUserEntity() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return korisnikRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Niste ulogovani"));
    }
}
