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
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Servis za upravljanje porudžbinama: kreiranje, pregled, promenu statusa,
 * otkazivanje i dodelu loyalty bodova.
 *
 * @author Nikola Dukić
 * @version 1.0
 */
@Service
@Transactional
public class PorudzbinaService {

    private final PorudzbinaRepository porudzbinaRepo;
    private final ProizvodRepository proizvodRepo;
    private final KorisnikRepository korisnikRepo;
    private final LoyaltyProgramRepository loyaltyRepo;
    private final NotifikacijaService notifikacijaService;
    private final RadnoVremeRepository radnoVremeRepo;
    private final Clock appClock;

    /**
     * Kreira servis sa potrebnim zavisnostima.
     *
     * @param porudzbinaRepo repozitorijum porudžbina
     * @param proizvodRepo repozitorijum proizvoda
     * @param korisnikRepo repozitorijum korisnika
     * @param loyaltyRepo repozitorijum loyalty programa
     * @param notifikacijaService servis notifikacija
     * @param radnoVremeRepo repozitorijum radnog vremena
     * @param appClock sat aplikacije (za vreme i proveru radnog vremena)
     */
    public PorudzbinaService(PorudzbinaRepository porudzbinaRepo, ProizvodRepository proizvodRepo, KorisnikRepository korisnikRepo, LoyaltyProgramRepository loyaltyRepo, NotifikacijaService notifikacijaService, RadnoVremeRepository radnoVremeRepo, Clock appClock){
        this.porudzbinaRepo = porudzbinaRepo;
        this.proizvodRepo = proizvodRepo;
        this.korisnikRepo = korisnikRepo;
        this.loyaltyRepo = loyaltyRepo;
        this.notifikacijaService = notifikacijaService;
        this.radnoVremeRepo = radnoVremeRepo;
        this.appClock = appClock;
    }

    /**
     * Vraća sve porudžbine.
     *
     * @return lista svih porudžbina
     */
    public List<PorudzbinaViewDto> getAll(){


        return porudzbinaRepo.findAll().stream()
                .map(PorudzbinaMapper::toViewDto)
                .collect(Collectors.toList());

    }

    /**
     * Vraća stranicu porudžbina, opciono filtriranih po statusu, sortiranih
     * opadajuće po identifikatoru.
     *
     * @param status filter po statusu, ili {@code null} za sve
     * @param pageNo redni broj stranice (od 0)
     * @param pageSize broj elemenata po stranici
     * @return stranica porudžbina
     */
    public Page<PorudzbinaViewDto> getAllPaged(StatusPorudzbine status, int pageNo, int pageSize) {
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by(Sort.Direction.DESC, "id"));

        Page<Porudzbina> page = status == null
                ? porudzbinaRepo.findAll(pageable)
                : porudzbinaRepo.findByStatus(status, pageable);

        return page.map(PorudzbinaMapper::toViewDto);
    }

    /**
     * Kreira novu porudžbinu za trenutno prijavljenog korisnika. Proverava
     * radno vreme i postojanje aktivne porudžbine, računa originalnu cenu i
     * cenu sa loyalty popustom.
     *
     * @param dto podaci o porudžbini (stavke, tip, napomena)
     * @return kreirana porudžbina
     * @throws ResponseStatusException sa statusom 400 ako je van radnog vremena,
     *         409 ako korisnik već ima aktivnu porudžbinu, 404 ako neki
     *         proizvod ne postoji, ili 401 ako korisnik nije prijavljen
     */
    public PorudzbinaViewDto create(PorudzbinaDto dto) {

        Korisnik trenutniKorisnik = getCurrentUserEntity();
        ensureRestaurantIsOpenNow();

        boolean imaAktivnu = porudzbinaRepo.existsByKorisnik_IdAndStatusIn(
                trenutniKorisnik.getId(),
                List.of(StatusPorudzbine.NOVA, StatusPorudzbine.U_PRIPREMI, StatusPorudzbine.SPREMNA)
        );
        if (imaAktivnu) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Već imaš aktivnu porudžbinu. Sačekaj da bude gotova pre nego što naručiš ponovo.");
        }

        Porudzbina por = new Porudzbina();
        por.setKorisnik(trenutniKorisnik);
        por.setNapomena(normalizeNapomena(dto.getNapomena()));
        por.setTipPorudzbine(dto.getTipPorudzbine() != null ? dto.getTipPorudzbine() : TipPorudzbine.ZA_PONETI);

        por.setDatum(LocalDateTime.now(appClock));
        por.setStatus(StatusPorudzbine.NOVA);

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

    /**
     * Vraća porudžbinu po identifikatoru. Obični korisnik može pristupiti samo
     * svojoj porudžbini.
     *
     * @param id identifikator porudžbine
     * @return pronađena porudžbina
     * @throws ResponseStatusException sa statusom 404 ako porudžbina ne postoji,
     *         ili 403 ako korisnik nema pravo pristupa
     */
    public PorudzbinaViewDto getById(Long id){


        Porudzbina p = porudzbinaRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Porudzbina sa ID-em" + id + " ne postoji"));

        Korisnik trenutniKorisnik = getCurrentUserEntity();


        if (trenutniKorisnik.getUloga() == Uloga.KORISNIK && !p.getKorisnikId().equals(trenutniKorisnik.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Nemate pravo pristupa ovoj porudžbini!");
        }

        return PorudzbinaMapper.toViewDto(p);


    }

    /**
     * Menja status porudžbine uz validaciju dozvoljenih prelaza. Pri prelasku
     * u {@link StatusPorudzbine#REALIZOVANA} korisniku se dodeljuju loyalty
     * bodovi i, po potrebi, podiže loyalty nivo. Šalje odgovarajuće
     * notifikacije.
     *
     * @param id identifikator porudžbine
     * @param noviStatus novi status
     * @throws ResponseStatusException sa statusom 404 ako porudžbina ili
     *         korisnik ne postoje, ili 400 ako prelaz statusa nije dozvoljen
     */
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
        int dodeljeniBodovi = 0;

        if (p.getStatus() != StatusPorudzbine.REALIZOVANA && noviStatus == StatusPorudzbine.REALIZOVANA) {

            Korisnik k = korisnikRepo.findById(p.getKorisnikId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Korisnik nije pronađen!"));

            int noviBodovi = p.getUkupanIznos()
                    .divide(BigDecimal.valueOf(100), 0, RoundingMode.DOWN)
                    .intValue();
            k.setBrojBodova(k.getBrojBodova() + noviBodovi);
            dodeljeniBodovi = noviBodovi;

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

        if (noviStatus == StatusPorudzbine.U_PRIPREMI && p.getProcenjenoVreme() != null) {
            sendAcceptedWithEstimatedTimeNotification(p.getKorisnikId(), p.getId(), p.getProcenjenoVreme());
        } else if (noviStatus == StatusPorudzbine.SPREMNA) {
            notifikacijaService.createForUser(
                    p.getKorisnikId(),
                    NotifikacijaTip.PORUDZBINA_SPREMNA,
                    String.format("Vaša porudžbina #%d je spremna. Možete je preuzeti.", p.getId())
            );
        } else if (noviStatus == StatusPorudzbine.OTKAZANA) {
            notifikacijaService.createForUser(
                    p.getKorisnikId(),
                    NotifikacijaTip.PORUDZBINA_OTKAZANA,
                    String.format("Vaša porudžbina #%d je otkazana.", p.getId())
            );
        } else if (noviStatus == StatusPorudzbine.REALIZOVANA) {
            String poruka = dodeljeniBodovi > 0
                    ? String.format("Vaša porudžbina #%d je preuzeta. Hvala! Osvojili ste %d bodova.", p.getId(), dodeljeniBodovi)
                    : String.format("Vaša porudžbina #%d je preuzeta. Hvala!", p.getId());
            notifikacijaService.createForUser(
                    p.getKorisnikId(),
                    NotifikacijaTip.PORUDZBINA_ZAVRSENA,
                    poruka
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

    /**
     * Postavlja procenjeno vreme pripreme porudžbine. Vreme se postavlja pri
     * prihvatanju (status {@link StatusPorudzbine#NOVA}) ili menja tokom
     * pripreme (status {@link StatusPorudzbine#U_PRIPREMI}); u drugom slučaju
     * korisniku se šalje notifikacija o promeni vremena.
     *
     * @param id identifikator porudžbine
     * @param procenjenoVreme procenjeno vreme u minutima (1–120)
     * @return ažurirana porudžbina
     * @throws ResponseStatusException sa statusom 400 ako je vreme van opsega
     *         ili status nije NOVA/U_PRIPREMI, odnosno 404 ako porudžbina
     *         ne postoji
     */
    public PorudzbinaViewDto setEstimatedTime(Long id, Integer procenjenoVreme) {
        if (procenjenoVreme == null || procenjenoVreme <= 0 || procenjenoVreme > 120) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Procenjeno vreme mora biti između 1 i 120 minuta"
            );
        }

        Porudzbina p = porudzbinaRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Porudzbina sa ID-em " + id + " ne postoji"));

        if (p.getStatus() != StatusPorudzbine.NOVA && p.getStatus() != StatusPorudzbine.U_PRIPREMI) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Procenjeno vreme može da se postavi samo za porudžbine u statusu NOVA ili U_PRIPREMI"
            );
        }

        Integer prethodnoProcenjenoVreme = p.getProcenjenoVreme();
        p.setProcenjenoVreme(procenjenoVreme);
        p = porudzbinaRepo.save(p);

        if (p.getStatus() == StatusPorudzbine.U_PRIPREMI && prethodnoProcenjenoVreme == null) {
            sendAcceptedWithEstimatedTimeNotification(p.getKorisnikId(), p.getId(), procenjenoVreme);
        } else if (p.getStatus() == StatusPorudzbine.U_PRIPREMI && !prethodnoProcenjenoVreme.equals(procenjenoVreme)) {
            sendEstimatedTimeChangedNotification(p.getKorisnikId(), p.getId(), prethodnoProcenjenoVreme, procenjenoVreme);
        }

        return PorudzbinaMapper.toViewDto(p);
    }

    /**
     * Vraća aktivnu porudžbinu trenutno prijavljenog korisnika (u statusu
     * NOVA, U_PRIPREMI ili SPREMNA), ako postoji.
     *
     * @return opciona aktivna porudžbina
     * @throws ResponseStatusException sa statusom 401 ako korisnik nije prijavljen
     */
    public Optional<PorudzbinaViewDto> getActiveOrder() {
        Korisnik korisnik = getCurrentUserEntity();
        return porudzbinaRepo.findFirstByKorisnik_IdAndStatusInOrderByIdDesc(
                korisnik.getId(),
                List.of(StatusPorudzbine.NOVA, StatusPorudzbine.U_PRIPREMI, StatusPorudzbine.SPREMNA)
        ).map(PorudzbinaMapper::toViewDto);
    }

    /**
     * Vraća stranicu porudžbina trenutno prijavljenog korisnika, sortiranih
     * opadajuće po identifikatoru.
     *
     * @param pageNo redni broj stranice (od 0)
     * @param pageSize broj elemenata po stranici
     * @return stranica porudžbina korisnika
     * @throws ResponseStatusException sa statusom 401 ako korisnik nije prijavljen
     */
    public Page<PorudzbinaViewDto> getMyOrders(int pageNo, int pageSize) {

        Korisnik korisnik = getCurrentUserEntity();

        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by(Sort.Direction.DESC, "id"));

        return porudzbinaRepo.findByKorisnik_Id(korisnik.getId(), pageable)
                .map(PorudzbinaMapper::toViewDto);
    }

    /**
     * Otkazuje porudžbinu trenutno prijavljenog korisnika. Moguće je otkazati
     * samo sopstvenu porudžbinu koja još nije spremna (NOVA ili U_PRIPREMI).
     *
     * @param id identifikator porudžbine
     * @throws ResponseStatusException sa statusom 404 ako porudžbina ne postoji,
     *         403 ako nije korisnikova, ili 400 ako nije u statusu NOVA/U_PRIPREMI
     */
    public void cancelMyOrder(Long id) {
        Korisnik korisnik = getCurrentUserEntity();

        Porudzbina porudzbina = porudzbinaRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Porudžbina ne postoji"));

        if (!porudzbina.getKorisnikId().equals(korisnik.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Možete otkazati samo svoju porudžbinu");
        }

        if (porudzbina.getStatus() != StatusPorudzbine.NOVA && porudzbina.getStatus() != StatusPorudzbine.U_PRIPREMI) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Porudžbina se može otkazati samo dok nije spremna");
        }

        porudzbina.setStatus(StatusPorudzbine.OTKAZANA);
        porudzbinaRepo.save(porudzbina);
        notifikacijaService.createForUser(
                porudzbina.getKorisnikId(),
                NotifikacijaTip.PORUDZBINA_OTKAZANA,
                String.format("Vaša porudžbina #%d je otkazana.", porudzbina.getId())
        );
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
     * Normalizuje (trimuje) napomenu. Prazna napomena se pretvara u {@code null}.
     *
     * @param napomena tekst napomene
     * @return normalizovana napomena ili {@code null}
     */
    private String normalizeNapomena(String napomena) {
        if (napomena == null) {
            return null;
        }
        String trimmed = napomena.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    /**
     * Proverava da li je restoran trenutno otvoren za poručivanje. Ako nije
     * definisano nijedno aktivno radno vreme, poručivanje je dozvoljeno.
     *
     * @throws ResponseStatusException sa statusom 400 ako je van radnog vremena
     */
    private void ensureRestaurantIsOpenNow() {
        if (radnoVremeRepo.findByAktivno(true).isEmpty()) {
            return;
        }

        LocalDateTime now = LocalDateTime.now(appClock);
        DanUNedelji dan = mapDayOfWeek(now.getDayOfWeek());
        LocalTime trenutnoVreme = now.toLocalTime();

        List<RadnoVreme> intervali = radnoVremeRepo.findByDanAndAktivno(dan, true);
        boolean otvoreno = intervali.stream().anyMatch(interval -> isWithinInterval(trenutnoVreme, interval));

        if (!otvoreno) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trenutno nije moguće poručivanje van radnog vremena");
        }
    }

    /**
     * Mapira {@link DayOfWeek} u domenski {@link DanUNedelji}.
     *
     * @param dayOfWeek dan u nedelji iz {@code java.time}
     * @return odgovarajući {@link DanUNedelji}
     */
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

    /**
     * Proverava da li trenutno vreme pada unutar zadatog intervala radnog
     * vremena. Podržava i intervale koji prelaze ponoć.
     *
     * @param trenutnoVreme trenutno vreme
     * @param interval interval radnog vremena
     * @return {@code true} ako je vreme unutar intervala, inače {@code false}
     */
    private boolean isWithinInterval(LocalTime trenutnoVreme, RadnoVreme interval) {
        LocalTime od = interval.getOdVremena();
        LocalTime doVremena = interval.getDoVremena();

        if (!od.isAfter(doVremena)) {
            return !trenutnoVreme.isBefore(od) && !trenutnoVreme.isAfter(doVremena);
        }

        return !trenutnoVreme.isBefore(od) || !trenutnoVreme.isAfter(doVremena);
    }

    /**
     * Šalje notifikaciju o prihvaćenoj porudžbini sa procenjenim vremenom
     * čekanja.
     *
     * @param korisnikId identifikator korisnika
     * @param porudzbinaId identifikator porudžbine
     * @param procenjenoVreme procenjeno vreme u minutima
     */
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

    /**
     * Šalje notifikaciju o promeni procenjenog vremena pripreme porudžbine.
     *
     * @param korisnikId identifikator korisnika
     * @param porudzbinaId identifikator porudžbine
     * @param staroVreme prethodno procenjeno vreme u minutima
     * @param novoVreme novo procenjeno vreme u minutima
     */
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

    /**
     * Validira da li je prelaz iz starog u novi status dozvoljen. Završene
     * porudžbine (REALIZOVANA, OTKAZANA) ne mogu menjati status.
     *
     * @param stariStatus trenutni status porudžbine
     * @param noviStatus željeni novi status
     * @throws ResponseStatusException sa statusom 400 ako prelaz nije dozvoljen
     */
    private void validateStatusTransition(StatusPorudzbine stariStatus, StatusPorudzbine noviStatus) {
        switch (stariStatus) {
            case NOVA -> {
                if (noviStatus != StatusPorudzbine.U_PRIPREMI && noviStatus != StatusPorudzbine.OTKAZANA) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Iz statusa NOVA možete preći samo u U_PRIPREMI ili OTKAZANA");
                }
            }
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
