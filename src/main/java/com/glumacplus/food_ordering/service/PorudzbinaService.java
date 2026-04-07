package com.glumacplus.food_ordering.service;

import com.glumacplus.food_ordering.dto.*;
import com.glumacplus.food_ordering.model.*;
import com.glumacplus.food_ordering.repository.KorisnikRepository;
import com.glumacplus.food_ordering.repository.LoyaltyProgramRepository;
import com.glumacplus.food_ordering.repository.PorudzbinaRepository;
import com.glumacplus.food_ordering.repository.ProizvodRepository;
import com.glumacplus.food_ordering.repository.RadnoVremeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
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
    private final NotifikacijaService notifikacijaService;
    private final RadnoVremeRepository radnoVremeRepo;

    public PorudzbinaService(PorudzbinaRepository porudzbinaRepo, ProizvodRepository proizvodRepo, KorisnikRepository korisnikRepo, LoyaltyProgramRepository loyaltyRepo, NotifikacijaService notifikacijaService, RadnoVremeRepository radnoVremeRepo){
        this.porudzbinaRepo = porudzbinaRepo;
        this.proizvodRepo = proizvodRepo;
        this.korisnikRepo = korisnikRepo;
        this.loyaltyRepo = loyaltyRepo;
        this.notifikacijaService = notifikacijaService;
        this.radnoVremeRepo = radnoVremeRepo;
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
        ensureRestaurantIsOpenNow();

        Porudzbina por = new Porudzbina();
        por.setKorisnik(trenutniKorisnik);
        por.setNapomena(normalizeNapomena(dto.getNapomena()));
        por.setTipPorudzbine(dto.getTipPorudzbine() != null ? dto.getTipPorudzbine() : TipPorudzbine.ZA_PONETI);

        por.setDatum(LocalDateTime.now());
        por.setStatus(StatusPorudzbine.U_PRIPREMI);

        BigDecimal ukIznos = BigDecimal.ZERO;

        for (StavkaPorudzbineDto stavkaDto: dto.getStavke()) {

            Proizvod p = proizvodRepo.findById(stavkaDto.getProizvodId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nema proizvoda"));

            StavkaPorudzbine prava = new StavkaPorudzbine();
            prava.setCena(p.getCena());
            prava.setKolicina(stavkaDto.getKolicina());
            prava.setProizvod(p);

            prava.setPorudzbina(por);



            por.dodajStavku(prava);
            ukIznos = ukIznos.add(prava.getIznosStavke());
        }



        por.setOriginalnaCena(ukIznos);

        double popust = 0.0;
        if (trenutniKorisnik.getLoyaltyProgram() != null) {
            popust = trenutniKorisnik.getLoyaltyProgram().getPopust();
        }

        BigDecimal popustFaktor = BigDecimal.valueOf(100.0 - popust)
                .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal cenaSaPopustom = ukIznos.multiply(popustFaktor)
                .setScale(2, RoundingMode.HALF_UP);

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

        validateStatusTransition(p.getStatus(), noviStatus);

        boolean loyaltyLevelUp = false;
        String noviNivoNaziv = null;

        if (p.getStatus() != StatusPorudzbine.REALIZOVANA && noviStatus == StatusPorudzbine.REALIZOVANA) {

            Korisnik k = korisnikRepo.findById(p.getKorisnikId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Korisnik nije pronađen!"));

            int noviBodovi = p.getUkupanIznos()
                    .divide(BigDecimal.valueOf(100), 0, RoundingMode.DOWN)
                    .intValue();
            k.setBrojBodova(k.getBrojBodova() + noviBodovi);

            List<LoyaltyProgram> sviNivoi = loyaltyRepo.findAll();

            Optional<LoyaltyProgram> sadasnji = sviNivoi.stream()
                    .filter(nivo -> k.getBrojBodova() >= nivo.getPragBodova())
                    .max(Comparator.comparing(LoyaltyProgram::getPragBodova));

            LoyaltyProgram prethodniNivo = k.getLoyaltyProgram();
            if (sadasnji.isPresent()) {
                LoyaltyProgram nivo = sadasnji.get();
                if (prethodniNivo == null || !prethodniNivo.getId().equals(nivo.getId())) {
                    k.setLoyaltyProgram(nivo);
                    loyaltyLevelUp = true;
                    noviNivoNaziv = nivo.getNivo();
                }
            }


            korisnikRepo.save(k);
        }

        p.setStatus(noviStatus);
        porudzbinaRepo.save(p);

        if (noviStatus == StatusPorudzbine.SPREMNA && p.getProcenjenoVreme() != null) {
            sendAcceptedWithEstimatedTimeNotification(p.getKorisnikId(), p.getId(), p.getProcenjenoVreme());
        } else if (noviStatus == StatusPorudzbine.OTKAZANA) {
            notifikacijaService.createForUser(
                    p.getKorisnikId(),
                    NotifikacijaTip.PORUDZBINA_OTKAZANA,
                    String.format("Vaša porudžbina #%d je otkazana.", p.getId())
            );
        } else if (noviStatus == StatusPorudzbine.REALIZOVANA) {
            notifikacijaService.createForUser(
                    p.getKorisnikId(),
                    NotifikacijaTip.PORUDZBINA_ZAVRSENA,
                    String.format("Vaša porudžbina #%d je gotova. Možete je preuzeti.", p.getId())
            );
        }

        if (loyaltyLevelUp && noviNivoNaziv != null) {
            notifikacijaService.createForUser(
                    p.getKorisnikId(),
                    NotifikacijaTip.LOYALTY_LEVEL_UP,
                    String.format("Čestitamo! Prešli ste u loyalty nivo: %s.", noviNivoNaziv)
            );
        }
    }

    public PorudzbinaViewDto setEstimatedTime(Long id, Integer procenjenoVreme) {
        if (procenjenoVreme == null || procenjenoVreme <= 0 || procenjenoVreme > 120) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Procenjeno vreme mora biti između 1 i 120 minuta"
            );
        }

        Porudzbina p = porudzbinaRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Porudzbina sa ID-em " + id + " ne postoji"));

        if (p.getStatus() != StatusPorudzbine.U_PRIPREMI && p.getStatus() != StatusPorudzbine.SPREMNA) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Procenjeno vreme može da se postavi samo za porudžbine u statusu U_PRIPREMI ili SPREMNA"
            );
        }

        Integer prethodnoProcenjenoVreme = p.getProcenjenoVreme();
        p.setProcenjenoVreme(procenjenoVreme);
        p = porudzbinaRepo.save(p);

        if (p.getStatus() == StatusPorudzbine.SPREMNA && prethodnoProcenjenoVreme == null) {
            sendAcceptedWithEstimatedTimeNotification(p.getKorisnikId(), p.getId(), procenjenoVreme);
        } else if (p.getStatus() == StatusPorudzbine.SPREMNA && !prethodnoProcenjenoVreme.equals(procenjenoVreme)) {
            sendEstimatedTimeChangedNotification(p.getKorisnikId(), p.getId(), prethodnoProcenjenoVreme, procenjenoVreme);
        }

        return PorudzbinaMapper.toViewDto(p);
    }

    public List<PorudzbinaViewDto> getMyOrders(int pageNo, int pageSize) {

        Korisnik korisnik = getCurrentUserEntity();

        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by(Sort.Direction.DESC, "id"));

        Page<Porudzbina> page = porudzbinaRepo.findByKorisnik_Id(korisnik.getId(), pageable);

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
        notifikacijaService.createForUser(
                porudzbina.getKorisnikId(),
                NotifikacijaTip.PORUDZBINA_OTKAZANA,
                String.format("Vaša porudžbina #%d je otkazana.", porudzbina.getId())
        );
    }

    private Korisnik getCurrentUserEntity() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return korisnikRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Niste ulogovani"));
    }

    private String normalizeNapomena(String napomena) {
        if (napomena == null) {
            return null;
        }
        String trimmed = napomena.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private void ensureRestaurantIsOpenNow() {
        if (radnoVremeRepo.findByAktivno(true).isEmpty()) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        DanUNedelji dan = mapDayOfWeek(now.getDayOfWeek());
        LocalTime trenutnoVreme = now.toLocalTime();

        List<RadnoVreme> intervali = radnoVremeRepo.findByDanAndAktivno(dan, true);
        boolean otvoreno = intervali.stream().anyMatch(interval -> isWithinInterval(trenutnoVreme, interval));

        if (!otvoreno) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trenutno nije moguće poručivanje van radnog vremena");
        }
    }

    private DanUNedelji mapDayOfWeek(DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case MONDAY -> DanUNedelji.PONEDELJAK;
            case TUESDAY -> DanUNedelji.UTORAK;
            case WEDNESDAY -> DanUNedelji.SREDA;
            case THURSDAY -> DanUNedelji.CETVRTAK;
            case FRIDAY -> DanUNedelji.PETAK;
            case SATURDAY -> DanUNedelji.SUBOTA;
            case SUNDAY -> DanUNedelji.NEDELJA;
        };
    }

    private boolean isWithinInterval(LocalTime trenutnoVreme, RadnoVreme interval) {
        LocalTime od = interval.getOdVremena();
        LocalTime doVremena = interval.getDoVremena();

        if (!od.isAfter(doVremena)) {
            return !trenutnoVreme.isBefore(od) && !trenutnoVreme.isAfter(doVremena);
        }

        return !trenutnoVreme.isBefore(od) || !trenutnoVreme.isAfter(doVremena);
    }

    private void sendAcceptedWithEstimatedTimeNotification(Long korisnikId, Long porudzbinaId, Integer procenjenoVreme) {
        notifikacijaService.createForUser(
                korisnikId,
                NotifikacijaTip.PORUDZBINA_PRIHVACENA,
                String.format(
                        "Vaša porudžbina #%d je prihvaćena i procenjeno vreme čekanja je %d minuta.",
                        porudzbinaId,
                        procenjenoVreme
                )
        );
    }

    private void sendEstimatedTimeChangedNotification(Long korisnikId, Long porudzbinaId, Integer staroVreme, Integer novoVreme) {
        notifikacijaService.createForUser(
                korisnikId,
                NotifikacijaTip.PORUDZBINA_VREME_PROMENJENO,
                String.format(
                        "Procenjeno vreme za porudžbinu #%d je promenjeno sa %d na %d minuta.",
                        porudzbinaId,
                        staroVreme,
                        novoVreme
                )
        );
    }

    private void validateStatusTransition(StatusPorudzbine stariStatus, StatusPorudzbine noviStatus) {
        switch (stariStatus) {
            case U_PRIPREMI -> {
                if (noviStatus != StatusPorudzbine.SPREMNA && noviStatus != StatusPorudzbine.OTKAZANA) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Iz statusa U_PRIPREMI možete preći samo u SPREMNA ili OTKAZANA");
                }
            }
            case SPREMNA -> {
                if (noviStatus != StatusPorudzbine.REALIZOVANA && noviStatus != StatusPorudzbine.OTKAZANA) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Iz statusa SPREMNA možete preći samo u REALIZOVANA ili OTKAZANA");
                }
            }
            case REALIZOVANA, OTKAZANA -> throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Promena statusa nije dozvoljena za završene porudžbine"
            );
        }
    }
}
