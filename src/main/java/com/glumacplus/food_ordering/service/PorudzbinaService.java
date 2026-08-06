package com.glumacplus.food_ordering.service;

import com.glumacplus.food_ordering.dto.*;
import com.glumacplus.food_ordering.model.*;
import com.glumacplus.food_ordering.repository.KorisnikRepository;
import com.glumacplus.food_ordering.util.FilterPorudzbina;
import com.glumacplus.food_ordering.util.LoyaltyNivo;
import com.glumacplus.food_ordering.util.Novac;
import com.glumacplus.food_ordering.util.Tekst;
import com.glumacplus.food_ordering.repository.LoyaltyProgramRepository;
import com.glumacplus.food_ordering.repository.PorudzbinaRepository;
import com.glumacplus.food_ordering.repository.ProizvodRepository;
import com.glumacplus.food_ordering.repository.SmenaStanjeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
    private final RadnoVremeService radnoVremeService;
    private final SmenaStanjeRepository smenaStanjeRepo;
    private final Clock appClock;

    /**
     * Kreira servis sa potrebnim zavisnostima.
     *
     * @param porudzbinaRepo repozitorijum porudžbina
     * @param proizvodRepo repozitorijum proizvoda
     * @param korisnikRepo repozitorijum korisnika
     * @param loyaltyRepo repozitorijum loyalty programa
     * @param notifikacijaService servis notifikacija
     * @param radnoVremeService servis radnog vremena (provera da li je otvoreno)
     * @param smenaStanjeRepo repozitorijum stanja smene (ručna pauza)
     * @param appClock sat aplikacije (za vreme porudžbine)
     */
    public PorudzbinaService(PorudzbinaRepository porudzbinaRepo, ProizvodRepository proizvodRepo, KorisnikRepository korisnikRepo, LoyaltyProgramRepository loyaltyRepo, NotifikacijaService notifikacijaService, RadnoVremeService radnoVremeService, SmenaStanjeRepository smenaStanjeRepo, Clock appClock){
        this.porudzbinaRepo = porudzbinaRepo;
        this.proizvodRepo = proizvodRepo;
        this.korisnikRepo = korisnikRepo;
        this.loyaltyRepo = loyaltyRepo;
        this.notifikacijaService = notifikacijaService;
        this.radnoVremeService = radnoVremeService;
        this.smenaStanjeRepo = smenaStanjeRepo;
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
     * Pretraga istorije porudžbina za admin panel: po broju porudžbine ili
     * kupcu, u opsegu datuma, opciono po statusu.
     *
     * <p>Pojam koji je ceo broj traži <b>isključivo</b> porudžbinu s tim brojem.
     * Sve ostalo se traži u imenu i e-mailu kupca <b>i u nazivima naručenih
     * proizvoda</b>, pri čemu se kvačice i pismo zanemaruju (vidi {@link Tekst}) —
     * „sunka", „šunka" i „шунка" daju isti rezultat.</p>
     *
     * @param status filter po statusu, ili {@code null} za sve
     * @param od prvi dan opsega uključivo, ili {@code null}
     * @param doDatuma poslednji dan opsega UKLJUČIVO, ili {@code null}
     * @param pojam broj porudžbine, deo imena/e-maila kupca ili naziv proizvoda, ili {@code null}
     * @param pageNo redni broj stranice (od 0)
     * @param pageSize broj elemenata po stranici
     * @return stranica pronađenih porudžbina, najnovije prve
     */
    public Page<PorudzbinaViewDto> pretrazi(StatusPorudzbine status, LocalDate od, LocalDate doDatuma,
                                            String pojam, int pageNo, int pageSize) {
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by(Sort.Direction.DESC, "id"));
        FilterPorudzbina f = FilterPorudzbina.napravi(status, od, doDatuma, pojam);

        // Kvačice i pismo se ne mogu zanemariti u SQL-u a da se poklope sa
        // pravilom koje koristi ostatak aplikacije, pa se poklapanje radi u Javi
        // nad šifarnicima (nekoliko korisnika, ~180 proizvoda), a upitu se
        // prosleđuju samo pronađeni ID-jevi. Vidi `util/Tekst`.
        List<Long> kupci = List.of();
        List<Long> proizvodi = List.of();
        if (f.pojam() != null) {
            kupci = korisnikRepo.findAll().stream()
                    .filter(k -> Tekst.sadrzi(k.getIme(), f.pojam()) || Tekst.sadrzi(k.getEmail(), f.pojam()))
                    .map(Korisnik::getId)
                    .toList();
            proizvodi = proizvodRepo.findAll().stream()
                    .filter(pr -> Tekst.sadrzi(pr.getNaziv(), f.pojam()))
                    .map(Proizvod::getId)
                    .toList();
        }

        final List<Long> idKupaca = kupci;
        final List<Long> idProizvoda = proizvodi;

        Specification<Porudzbina> uslov = (root, upit, cb) -> {
            List<Predicate> uslovi = new java.util.ArrayList<>();

            if (f.status() != null) uslovi.add(cb.equal(root.get("status"), f.status()));
            if (f.od() != null) uslovi.add(cb.greaterThanOrEqualTo(root.get("datum"), f.od()));
            if (f.doVremena() != null) uslovi.add(cb.lessThan(root.get("datum"), f.doVremena()));

            if (f.imaPretragu()) {
                List<Predicate> ili = new java.util.ArrayList<>();

                if (f.brojPorudzbine() != null) {
                    ili.add(cb.equal(root.get("id"), f.brojPorudzbine()));
                }
                if (!idKupaca.isEmpty()) {
                    ili.add(root.get("korisnik").get("id").in(idKupaca));
                }
                if (!idProizvoda.isEmpty()) {
                    // Podupit umesto join-a: join bi umnožio porudžbinu sa više
                    // stavki koje se poklapaju, pa bi ista ušla u rezultat dvaput.
                    Subquery<Long> ima = upit.subquery(Long.class);
                    Root<StavkaPorudzbine> st = ima.from(StavkaPorudzbine.class);
                    ima.select(st.get("id")).where(cb.and(
                            cb.equal(st.get("porudzbina"), root),
                            st.get("proizvod").get("id").in(idProizvoda)
                    ));
                    ili.add(cb.exists(ima));
                }

                // Pojam koji ne odgovara ničemu ne sme da vrati sve.
                uslovi.add(ili.isEmpty() ? cb.disjunction() : cb.or(ili.toArray(new Predicate[0])));
            }

            return cb.and(uslovi.toArray(new Predicate[0]));
        };

        return porudzbinaRepo.findAll(uslov, pageable).map(PorudzbinaMapper::toViewDto);
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

            if (!p.isDostupan()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Proizvod '" + p.getNaziv() + "' trenutno nije dostupan.");
            }

            StavkaPorudzbine prava = new StavkaPorudzbine();
            prava.setCena(p.getCena());
            prava.setKolicina(stavkaDto.getKolicina());
            prava.setProizvod(p);

            prava.setPorudzbina(por);

            dodajDodatke(prava, p, stavkaDto.getDodaci());

            por.dodajStavku(prava);
            ukIznos = ukIznos.add(prava.getIznosStavke());
        }



        // Osnovica je zbir već zaokruženih linija, pa je i sama ceo dinar.
        por.setOriginalnaCena(Novac.zaokruzi(ukIznos));

        double popust = 0.0;
        if (trenutniKorisnik.getLoyaltyProgram() != null) {
            popust = trenutniKorisnik.getLoyaltyProgram().getPopust();
        }

        // Zaokružuje se FINALNA cena, popust se nikad ne računa zasebno — inače
        // `originalnaCena = ukupanIznos + popust` ne bi važilo. Isto pravilo je i
        // na frontendu (utils/korpa.ts), pa korpa i račun uvek pokazuju isti broj.
        por.setUkupanIznos(Novac.saPopustom(por.getOriginalnaCena(), popust));
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

            // Isto pravilo koristi i ručna ispravka bodova u KorisnikService.
            Optional<LoyaltyProgram> sadasnji = LoyaltyNivo.odredi(loyaltyRepo.findAll(), k.getBrojBodova());

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
     * Dodaje izabrane dodatke na stavku porudžbine. Svaki dodatak mora biti
     * proizvod iz kategorije {@link Proizvod#TIP_DODACI}, dostupan i
     * odgovarajućeg ukusa (slatki dodaci idu uz slatke stavke, slani uz slane).
     * Cena dodatka se pamti kao snapshot.
     *
     * @param stavka stavka na koju se dodaci vezuju
     * @param osnovni osnovni proizvod stavke (za proveru ukusa)
     * @param dodaciDto izabrani dodaci; može biti {@code null} ili prazno
     * @throws ResponseStatusException sa statusom 404 ako dodatak ne postoji,
     *         409 ako nije dostupan, ili 400 ako nije dodatak odnosno ne
     *         odgovara ukusu stavke
     */
    private void dodajDodatke(StavkaPorudzbine stavka, Proizvod osnovni, List<StavkaDodatakDto> dodaciDto) {
        if (dodaciDto == null || dodaciDto.isEmpty()) {
            return;
        }

        // Dodatak ne može da nosi svoje dodatke (npr. Nutela uz Nutelu).
        if (Proizvod.TIP_DODACI.equalsIgnoreCase(osnovni.getTip())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Na dodatak '" + osnovni.getNaziv() + "' ne mogu da se dodaju dodaci.");
        }

        for (StavkaDodatakDto dodatakDto : dodaciDto) {
            Proizvod dodatak = proizvodRepo.findById(dodatakDto.getProizvodId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dodatak ne postoji"));

            if (!Proizvod.TIP_DODACI.equalsIgnoreCase(dodatak.getTip())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "'" + dodatak.getNaziv() + "' nije dodatak.");
            }

            if (!dodatak.isDostupan()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Dodatak '" + dodatak.getNaziv() + "' trenutno nije dostupan.");
            }

            // Ukus se proverava samo kad je poznat za oba (npr. piće nema ukus).
            if (dodatak.getUkus() != null && osnovni.getUkus() != null
                    && dodatak.getUkus() != osnovni.getUkus()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Dodatak '" + dodatak.getNaziv() + "' ne ide uz '" + osnovni.getNaziv() + "'.");
            }

            double kolicina = dodatakDto.getKolicina() > 0 ? dodatakDto.getKolicina() : 1;
            stavka.dodajDodatak(new StavkaDodatak(dodatak, kolicina, dodatak.getCena()));
        }
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
        // Ručna pauza — zaposleni je zaustavio primanje porudžbina i unutar radnog vremena.
        boolean pauzirano = smenaStanjeRepo.findById(1L)
                .map(SmenaStanje::isPauzirano)
                .orElse(false);
        if (pauzirano) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trenutno ne primamo porudžbine. Pokušaj kasnije.");
        }

        if (!radnoVremeService.jeOtvorenoSada()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trenutno nije moguće poručivanje van radnog vremena");
        }
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
