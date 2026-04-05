package com.glumacplus.food_ordering.service;

import com.glumacplus.food_ordering.dto.NotifikacijaCreateDto;
import com.glumacplus.food_ordering.dto.NotifikacijaMapper;
import com.glumacplus.food_ordering.dto.NotifikacijaViewDto;
import com.glumacplus.food_ordering.model.Korisnik;
import com.glumacplus.food_ordering.model.Notifikacija;
import com.glumacplus.food_ordering.model.NotifikacijaTip;
import com.glumacplus.food_ordering.repository.KorisnikRepository;
import com.glumacplus.food_ordering.repository.NotifikacijaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class NotifikacijaService {

    private final NotifikacijaRepository notifikacijaRepo;
    private final KorisnikRepository korisnikRepo;

    public NotifikacijaService(NotifikacijaRepository notifikacijaRepo, KorisnikRepository korisnikRepo) {
        this.notifikacijaRepo = notifikacijaRepo;
        this.korisnikRepo = korisnikRepo;
    }

    public Page<NotifikacijaViewDto> getMyNotifications(Boolean procitana, int pageNo, int pageSize) {
        Korisnik korisnik = getCurrentUserEntity();
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by(Sort.Direction.DESC, "datum"));

        Page<Notifikacija> page = procitana == null
                ? notifikacijaRepo.findByKorisnikIdOrderByDatumDesc(korisnik.getId(), pageable)
                : notifikacijaRepo.findByKorisnikIdAndProcitanaOrderByDatumDesc(korisnik.getId(), procitana, pageable);

        return page.map(NotifikacijaMapper::toViewDto);
    }

    public NotifikacijaViewDto markMyNotificationReadState(Long id, boolean procitana) {
        Korisnik korisnik = getCurrentUserEntity();
        Notifikacija notifikacija = notifikacijaRepo.findByIdAndKorisnikId(id, korisnik.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notifikacija nije pronađena"));
        notifikacija.setProcitana(procitana);
        notifikacija = notifikacijaRepo.save(notifikacija);
        return NotifikacijaMapper.toViewDto(notifikacija);
    }

    public int markAllMyAsRead() {
        Korisnik korisnik = getCurrentUserEntity();
        return notifikacijaRepo.markAllAsReadByKorisnikId(korisnik.getId());
    }

    public NotifikacijaViewDto create(NotifikacijaCreateDto dto) {
        Korisnik korisnik = korisnikRepo.findById(dto.getKorisnikId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Korisnik nije pronađen"));
        String normalizedPoruka = normalizePoruka(dto.getPoruka());
        NotifikacijaTip tip = dto.getTip() != null ? dto.getTip() : NotifikacijaTip.RUCNO;

        Notifikacija notifikacija = new Notifikacija();
        notifikacija.setKorisnik(korisnik);
        notifikacija.setTip(tip);
        notifikacija.setPoruka(normalizedPoruka);
        notifikacija = notifikacijaRepo.save(notifikacija);
        return NotifikacijaMapper.toViewDto(notifikacija);
    }

    public void createForUser(Long korisnikId, NotifikacijaTip tip, String poruka) {
        Korisnik korisnik = korisnikRepo.findById(korisnikId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Korisnik nije pronađen"));
        if (tip == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tip notifikacije je obavezan");
        }
        String normalizedPoruka = normalizePoruka(poruka);

        Notifikacija notifikacija = new Notifikacija();
        notifikacija.setKorisnik(korisnik);
        notifikacija.setTip(tip);
        notifikacija.setPoruka(normalizedPoruka);
        notifikacijaRepo.save(notifikacija);
    }

    public long countUnread() {
        Korisnik korisnik = getCurrentUserEntity();
        return notifikacijaRepo.countByKorisnikIdAndProcitana(korisnik.getId(), false);
    }

    private Korisnik getCurrentUserEntity() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return korisnikRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Niste ulogovani"));
    }

    private String normalizePoruka(String poruka) {
        if (poruka == null || poruka.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Poruka notifikacije ne sme biti prazna");
        }
        return poruka.trim();
    }
}
