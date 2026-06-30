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

import java.time.Clock;
import java.time.LocalDateTime;

/**
 * Servis za upravljanje notifikacijama korisnika.
 *
 * @author Nikola Dukić
 * @version 1.0
 */
@Service
@Transactional
public class NotifikacijaService {

    private final NotifikacijaRepository notifikacijaRepo;
    private final KorisnikRepository korisnikRepo;
    private final Clock appClock;

    /**
     * Kreira servis sa potrebnim zavisnostima.
     *
     * @param notifikacijaRepo repozitorijum notifikacija
     * @param korisnikRepo repozitorijum korisnika
     * @param appClock sat aplikacije (za vreme kreiranja)
     */
    public NotifikacijaService(NotifikacijaRepository notifikacijaRepo, KorisnikRepository korisnikRepo, Clock appClock) {
        this.notifikacijaRepo = notifikacijaRepo;
        this.korisnikRepo = korisnikRepo;
        this.appClock = appClock;
    }

    /**
     * Vraća paginaciju notifikacija trenutno prijavljenog korisnika, opciono
     * filtriranih po statusu pročitanosti, sortiranih opadajuće po datumu.
     *
     * @param procitana filter po statusu pročitanosti, ili {@code null} za sve
     * @param pageNo redni broj stranice (od 0)
     * @param pageSize broj elemenata po stranici
     * @return stranica notifikacija
     * @throws ResponseStatusException sa statusom 401 ako korisnik nije prijavljen
     */
    public Page<NotifikacijaViewDto> getMyNotifications(Boolean procitana, int pageNo, int pageSize) {
        Korisnik korisnik = getCurrentUserEntity();
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by(Sort.Direction.DESC, "datum"));

        Page<Notifikacija> page = procitana == null
                ? notifikacijaRepo.findByKorisnikIdOrderByDatumDesc(korisnik.getId(), pageable)
                : notifikacijaRepo.findByKorisnikIdAndProcitanaOrderByDatumDesc(korisnik.getId(), procitana, pageable);

        return page.map(NotifikacijaMapper::toViewDto);
    }

    /**
     * Postavlja status pročitanosti notifikacije trenutno prijavljenog
     * korisnika.
     *
     * @param id identifikator notifikacije
     * @param procitana novi status pročitanosti
     * @return ažurirana notifikacija
     * @throws ResponseStatusException sa statusom 404 ako notifikacija ne
     *         pripada korisniku ili ne postoji
     */
    public NotifikacijaViewDto markMyNotificationReadState(Long id, boolean procitana) {
        Korisnik korisnik = getCurrentUserEntity();
        Notifikacija notifikacija = notifikacijaRepo.findByIdAndKorisnikId(id, korisnik.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notifikacija nije pronađena"));
        notifikacija.setProcitana(procitana);
        notifikacija = notifikacijaRepo.save(notifikacija);
        return NotifikacijaMapper.toViewDto(notifikacija);
    }

    /**
     * Označava sve notifikacije trenutno prijavljenog korisnika kao pročitane.
     *
     * @return broj notifikacija koje su označene kao pročitane
     * @throws ResponseStatusException sa statusom 401 ako korisnik nije prijavljen
     */
    public int markAllMyAsRead() {
        Korisnik korisnik = getCurrentUserEntity();
        return notifikacijaRepo.markAllAsReadByKorisnikId(korisnik.getId());
    }

    /**
     * Kreira notifikaciju za zadatog korisnika na osnovu DTO podataka.
     *
     * @param dto podaci o notifikaciji (korisnik, poruka, opciono tip)
     * @return kreirana notifikacija
     * @throws ResponseStatusException sa statusom 404 ako korisnik ne postoji,
     *         ili 400 ako je poruka prazna
     */
    public NotifikacijaViewDto create(NotifikacijaCreateDto dto) {
        Korisnik korisnik = korisnikRepo.findById(dto.getKorisnikId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Korisnik nije pronađen"));
        String normalizedPoruka = normalizePoruka(dto.getPoruka());
        NotifikacijaTip tip = dto.getTip() != null ? dto.getTip() : NotifikacijaTip.RUCNO;

        Notifikacija notifikacija = new Notifikacija();
        notifikacija.setKorisnik(korisnik);
        notifikacija.setTip(tip);
        notifikacija.setPoruka(normalizedPoruka);
        notifikacija.setDatum(LocalDateTime.now(appClock));
        notifikacija = notifikacijaRepo.save(notifikacija);
        return NotifikacijaMapper.toViewDto(notifikacija);
    }

    /**
     * Kreira notifikaciju za korisnika sa zadatim tipom i porukom. Koristi se
     * interno pri automatskim obaveštenjima (npr. promena statusa porudžbine).
     *
     * @param korisnikId identifikator korisnika
     * @param tip tip notifikacije
     * @param poruka tekst poruke
     * @throws ResponseStatusException sa statusom 404 ako korisnik ne postoji,
     *         ili 400 ako je tip {@code null} ili je poruka prazna
     */
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
        notifikacija.setDatum(LocalDateTime.now(appClock));
        notifikacijaRepo.save(notifikacija);
    }

    /**
     * Vraća broj nepročitanih notifikacija trenutno prijavljenog korisnika.
     *
     * @return broj nepročitanih notifikacija
     * @throws ResponseStatusException sa statusom 401 ako korisnik nije prijavljen
     */
    public long countUnread() {
        Korisnik korisnik = getCurrentUserEntity();
        return notifikacijaRepo.countByKorisnikIdAndProcitana(korisnik.getId(), false);
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

    /**
     * Normalizuje (trimuje) tekst poruke i validira da nije prazan.
     *
     * @param poruka tekst poruke
     * @return normalizovan tekst poruke
     * @throws ResponseStatusException sa statusom 400 ako je poruka prazna
     */
    private String normalizePoruka(String poruka) {
        if (poruka == null || poruka.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Poruka notifikacije ne sme biti prazna");
        }
        return poruka.trim();
    }
}
