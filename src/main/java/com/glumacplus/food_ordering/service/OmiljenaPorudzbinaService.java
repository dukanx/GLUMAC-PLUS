package com.glumacplus.food_ordering.service;

import com.glumacplus.food_ordering.dto.*;
import com.glumacplus.food_ordering.model.*;
import com.glumacplus.food_ordering.repository.KorisnikRepository;
import com.glumacplus.food_ordering.repository.OmiljenaPorudzbinaRepository;
import com.glumacplus.food_ordering.repository.PorudzbinaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class OmiljenaPorudzbinaService {

    private final OmiljenaPorudzbinaRepository omiljenaPorudzbinaRepo;
    private final PorudzbinaRepository porudzbinaRepo;
    private final PorudzbinaService porudzbinaService;
    private final KorisnikRepository korisnikRepo;
    private final Clock appClock;

    public OmiljenaPorudzbinaService(
            OmiljenaPorudzbinaRepository omiljenaPorudzbinaRepo,
            PorudzbinaRepository porudzbinaRepo,
            PorudzbinaService porudzbinaService,
            KorisnikRepository korisnikRepo,
            Clock appClock
    ) {
        this.omiljenaPorudzbinaRepo = omiljenaPorudzbinaRepo;
        this.porudzbinaRepo = porudzbinaRepo;
        this.porudzbinaService = porudzbinaService;
        this.korisnikRepo = korisnikRepo;
        this.appClock = appClock;
    }

    public List<OmiljenaPorudzbinaViewDto> getMyFavorites() {
        Korisnik korisnik = getCurrentUserEntity();
        return omiljenaPorudzbinaRepo.findByKorisnik_IdOrderByIdDesc(korisnik.getId()).stream()
                .map(OmiljenaPorudzbinaMapper::toViewDto)
                .collect(Collectors.toList());
    }

    public OmiljenaPorudzbinaViewDto createFromOrder(Long porudzbinaId, String naziv) {
        Korisnik korisnik = getCurrentUserEntity();

        Porudzbina porudzbina = porudzbinaRepo.findById(porudzbinaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Porudžbina ne postoji"));

        if (!porudzbina.getKorisnikId().equals(korisnik.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Možete sačuvati samo svoju porudžbinu u omiljene");
        }

        if (porudzbina.getStavke() == null || porudzbina.getStavke().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Porudžbina nema stavke");
        }

        OmiljenaPorudzbina omiljenaPorudzbina = new OmiljenaPorudzbina();
        omiljenaPorudzbina.setKorisnik(korisnik);
        omiljenaPorudzbina.setNaziv(normalizeNaziv(naziv, porudzbinaId));
        omiljenaPorudzbina.setDatumKreiranja(LocalDateTime.now(appClock));

        for (StavkaPorudzbine stavkaPorudzbine : porudzbina.getStavke()) {
            OmiljenaPorudzbinaStavka stavka = new OmiljenaPorudzbinaStavka();
            stavka.setProizvod(stavkaPorudzbine.getProizvod());
            stavka.setKolicina(stavkaPorudzbine.getKolicina());
            omiljenaPorudzbina.dodajStavku(stavka);
        }

        omiljenaPorudzbina = omiljenaPorudzbinaRepo.save(omiljenaPorudzbina);
        return OmiljenaPorudzbinaMapper.toViewDto(omiljenaPorudzbina);
    }

    public PorudzbinaViewDto repeatMyFavorite(Long omiljenaPorudzbinaId, TipPorudzbine tipPorudzbine, String napomena) {
        Korisnik korisnik = getCurrentUserEntity();
        OmiljenaPorudzbina omiljenaPorudzbina = omiljenaPorudzbinaRepo.findByIdAndKorisnik_Id(omiljenaPorudzbinaId, korisnik.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Omiljena porudžbina nije pronađena"));

        if (omiljenaPorudzbina.getStavke() == null || omiljenaPorudzbina.getStavke().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Omiljena porudžbina nema stavke");
        }

        PorudzbinaDto dto = new PorudzbinaDto();
        dto.setTipPorudzbine(tipPorudzbine);
        dto.setNapomena(napomena);

        List<StavkaPorudzbineDto> stavkeDto = omiljenaPorudzbina.getStavke().stream()
                .map(stavka -> {
                    StavkaPorudzbineDto stavkaDto = new StavkaPorudzbineDto();
                    stavkaDto.setProizvodId(stavka.getProizvod().getId());
                    stavkaDto.setKolicina(stavka.getKolicina());
                    return stavkaDto;
                })
                .collect(Collectors.toList());

        dto.setStavke(stavkeDto);
        return porudzbinaService.create(dto);
    }

    public void deleteMyFavorite(Long omiljenaPorudzbinaId) {
        Korisnik korisnik = getCurrentUserEntity();
        OmiljenaPorudzbina omiljenaPorudzbina = omiljenaPorudzbinaRepo.findByIdAndKorisnik_Id(omiljenaPorudzbinaId, korisnik.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Omiljena porudžbina nije pronađena"));
        omiljenaPorudzbinaRepo.delete(omiljenaPorudzbina);
    }

    private Korisnik getCurrentUserEntity() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return korisnikRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Niste ulogovani"));
    }

    private String normalizeNaziv(String naziv, Long porudzbinaId) {
        if (naziv == null || naziv.trim().isEmpty()) {
            return "Omiljena porudžbina #" + porudzbinaId;
        }
        return naziv.trim();
    }
}
