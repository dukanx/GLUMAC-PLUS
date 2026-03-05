package com.glumacplus.food_ordering.service;

import com.glumacplus.food_ordering.dto.*;
import com.glumacplus.food_ordering.model.*;
import com.glumacplus.food_ordering.repository.KorisnikRepository;
import com.glumacplus.food_ordering.repository.LoyaltyProgramRepository;
import com.glumacplus.food_ordering.repository.PorudzbinaRepository;
import com.glumacplus.food_ordering.repository.ProizvodRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class PorudzbinaService {

    private final PorudzbinaRepository porudzbinaRepo;
    private final ProizvodRepository proizvodRepo;
    private final KorisnikRepository korisnikRepo;
    private final LoyaltyProgramRepository loyaltyRepo;

    public PorudzbinaService(PorudzbinaRepository porudzbinaRepo, ProizvodRepository proizvodRepo, KorisnikRepository korisnikRepo, LoyaltyProgramRepository loyaltyRepo){
        this.porudzbinaRepo = porudzbinaRepo;
        this.proizvodRepo = proizvodRepo;
        this.korisnikRepo = korisnikRepo;
        this.loyaltyRepo = loyaltyRepo;
    }

    public List<PorudzbinaViewDto> getAll(){


        return porudzbinaRepo.findAll().stream()
                .map(PorudzbinaMapper::toViewDto)
                .collect(Collectors.toList());

    }

    public Page<PorudzbinaViewDto> getAllPaged(StatusPorudzbine status, int pageNo, int pageSize) {
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by(Sort.Direction.DESC, "id"));

        Page<Porudzbina> page = status == null
                ? porudzbinaRepo.findAll(pageable)
                : porudzbinaRepo.findByStatus(status, pageable);

        return page.map(PorudzbinaMapper::toViewDto);
    }

    public PorudzbinaViewDto create(PorudzbinaDto dto) {

        Korisnik trenutniKorisnik = getCurrentUserEntity();

        Porudzbina por = new Porudzbina();
        por.setKorisnikId(trenutniKorisnik.getId());

        por.setDatum(LocalDateTime.now());
        por.setStatus(StatusPorudzbine.U_PRIPREMI);

        double ukIznos=0;

        for (StavkaPorudzbineDto stavkaDto: dto.getStavke()) {

            Proizvod p = proizvodRepo.findById(stavkaDto.getProizvodId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nema proizvoda"));

            StavkaPorudzbine prava = new StavkaPorudzbine();
            prava.setCena(p.getCena());
            prava.setKolicina(stavkaDto.getKolicina());
            prava.setProizvod(p);

            prava.setPorudzbina(por);



            por.dodajStavku(prava);
            ukIznos += prava.getIznosStavke();
        }



        por.setOriginalnaCena(ukIznos);

        double popust = 0.0;
        if (trenutniKorisnik.getLoyaltyProgram() != null) {
            popust = trenutniKorisnik.getLoyaltyProgram().getPopust();
        }

        double cenaSaPopustom = ukIznos * (100 - popust) / 100;

        por.setUkupanIznos(cenaSaPopustom);
        por = porudzbinaRepo.save(por);

        return PorudzbinaMapper.toViewDto(por);
    }

    public PorudzbinaViewDto getById(Long id){


        Porudzbina p = porudzbinaRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Porudzbina sa ID-em" + id + " ne postoji"));

        Korisnik trenutniKorisnik = getCurrentUserEntity();


        if (trenutniKorisnik.getUloga() == Uloga.KORISNIK && !p.getKorisnikId().equals(trenutniKorisnik.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Nemate pravo pristupa ovoj porudžbini!");
        }

        return PorudzbinaMapper.toViewDto(p);


    }

    @Transactional
    public void changeStatus(Long id, StatusPorudzbine noviStatus){

        Porudzbina p = porudzbinaRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Porudzbina sa ID-em" + id + " ne postoji"));

        if (p.getStatus() == noviStatus) {
            return;
        }

        if (p.getStatus() != StatusPorudzbine.REALIZOVANA && noviStatus == StatusPorudzbine.REALIZOVANA) {

            Korisnik k = korisnikRepo.findById(p.getKorisnikId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Korisnik nije pronađen!"));

            int noviBodovi = (int) (p.getUkupanIznos() / 100);
            k.setBrojBodova(k.getBrojBodova() + noviBodovi);

            List<LoyaltyProgram> sviNivoi = loyaltyRepo.findAll();

            Optional<LoyaltyProgram> sadasnji = sviNivoi.stream()
                    .filter(nivo -> k.getBrojBodova() >= nivo.getPragBodova())
                    .max(Comparator.comparing(LoyaltyProgram::getPragBodova));

            sadasnji.ifPresent(nivo -> {
                        if (k.getLoyaltyProgram() == null || !k.getLoyaltyProgram().getId().equals(nivo.getId())) {
                            k.setLoyaltyProgram(nivo);
                            System.out.println("Čestitamo! Napredovali ste u nivo: " + nivo.getNivo());
                        }
            });


            korisnikRepo.save(k);
        }

        p.setStatus(noviStatus);
        porudzbinaRepo.save(p);
    }

    public List<PorudzbinaViewDto> getMyOrders(int pageNo, int pageSize) {

        Korisnik korisnik = getCurrentUserEntity();

        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by(Sort.Direction.DESC, "id"));

        Page<Porudzbina> page = porudzbinaRepo.findByKorisnikId(korisnik.getId(), pageable);

        return page.getContent().stream()
                .map(PorudzbinaMapper::toViewDto)
                .collect(Collectors.toList());
    }

    public void cancelMyOrder(Long id) {
        Korisnik korisnik = getCurrentUserEntity();

        Porudzbina porudzbina = porudzbinaRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Porudžbina ne postoji"));

        if (!porudzbina.getKorisnikId().equals(korisnik.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Možete otkazati samo svoju porudžbinu");
        }

        if (porudzbina.getStatus() != StatusPorudzbine.U_PRIPREMI) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Porudžbina se može otkazati samo dok je u pripremi");
        }

        porudzbina.setStatus(StatusPorudzbine.OTKAZANA);
        porudzbinaRepo.save(porudzbina);
    }

    private Korisnik getCurrentUserEntity() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return korisnikRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Niste ulogovani"));
    }
}
