package com.glumacplus.food_ordering.service;

import com.glumacplus.food_ordering.dto.SmenaStanjeDto;
import com.glumacplus.food_ordering.dto.SmenaStatDto;
import com.glumacplus.food_ordering.model.Porudzbina;
import com.glumacplus.food_ordering.model.Proizvod;
import com.glumacplus.food_ordering.model.RazlogNedostupnosti;
import com.glumacplus.food_ordering.model.SmenaStanje;
import com.glumacplus.food_ordering.model.StatusPorudzbine;
import com.glumacplus.food_ordering.repository.PorudzbinaRepository;
import com.glumacplus.food_ordering.repository.ProizvodRepository;
import com.glumacplus.food_ordering.repository.SmenaStanjeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.util.List;

/**
 * Operacije oko smene: pregled dnevne statistike, ručno i automatsko
 * zatvaranje/otvaranje smene (vezano za radno vreme). Pri zatvaranju se
 * proizvodi skinuti "do kraja smene" vraćaju u ponudu.
 *
 * @author Nikola Dukić
 * @version 1.0
 */
@Service
public class SmenaService {

    private static final Logger log = LoggerFactory.getLogger(SmenaService.class);

    private final ProizvodRepository proizvodRepo;
    private final PorudzbinaRepository porudzbinaRepo;
    private final RadnoVremeService radnoVremeService;
    private final SmenaStanjeRepository smenaStanjeRepo;
    private final Clock clock;

    /** Poslednje viđeno stanje (otvoreno/zatvoreno) — za detekciju prelaza u scheduler-u. */
    private Boolean biloOtvoreno = null;

    public SmenaService(ProizvodRepository proizvodRepo, PorudzbinaRepository porudzbinaRepo,
                        RadnoVremeService radnoVremeService, SmenaStanjeRepository smenaStanjeRepo, Clock clock) {
        this.proizvodRepo = proizvodRepo;
        this.porudzbinaRepo = porudzbinaRepo;
        this.radnoVremeService = radnoVremeService;
        this.smenaStanjeRepo = smenaStanjeRepo;
        this.clock = clock;
    }

    /** Vraća (i po potrebi kreira) jedini red stanja smene. */
    private SmenaStanje stanjeEntitet() {
        return smenaStanjeRepo.findById(1L).orElseGet(() -> {
            SmenaStanje s = new SmenaStanje();
            s.setId(1L);
            s.setPauzirano(false);
            return smenaStanjeRepo.save(s);
        });
    }

    /** Da li je primanje porudžbina ručno pauzirano. */
    public boolean jePauzirano() {
        return smenaStanjeRepo.findById(1L).map(SmenaStanje::isPauzirano).orElse(false);
    }

    /** Trenutno stanje smene (za panel). */
    public SmenaStanjeDto stanje() {
        boolean pauzirano = jePauzirano();
        boolean uRadnom = radnoVremeService.jeOtvorenoSada();
        return new SmenaStanjeDto(pauzirano, uRadnom, uRadnom && !pauzirano);
    }

    /** Ručno postavljanje pauze primanja porudžbina. */
    @Transactional
    public SmenaStanjeDto setPauza(boolean pauzirano) {
        SmenaStanje s = stanjeEntitet();
        s.setPauzirano(pauzirano);
        smenaStanjeRepo.save(s);
        log.info("Smena {} ručno.", pauzirano ? "pauzirana" : "nastavljena");
        return stanje();
    }

    /**
     * Vraća sažetak smene bez izmena — koliko proizvoda bi se vratilo i dnevnu statistiku.
     *
     * @return statistika smene
     */
    public SmenaStatDto pregled() {
        int zaVracanje = proizvodRepo.findAllByNedostupanRazlog(RazlogNedostupnosti.DO_KRAJA_SMENE).size();
        return statistika(zaVracanje);
    }

    /**
     * Ručno zatvaranje smene — proizvodi skinuti "do kraja smene" se vraćaju u ponudu.
     * Proizvodi skinuti "do daljnjeg" ostaju nedostupni.
     *
     * @return statistika smene (uz broj vraćenih proizvoda)
     */
    @Transactional
    public SmenaStatDto zatvori() {
        int vraceno = vratiProizvodeDoKrajaSmene();
        // Kraj dana — zaustavi primanje porudžbina do sledećeg otvaranja.
        SmenaStanje s = stanjeEntitet();
        s.setPauzirano(true);
        smenaStanjeRepo.save(s);
        return statistika(vraceno);
    }

    /**
     * Vraća sve proizvode skinute "do kraja smene" nazad u ponudu.
     *
     * @return broj vraćenih proizvoda
     */
    public int vratiProizvodeDoKrajaSmene() {
        List<Proizvod> zaVracanje = proizvodRepo.findAllByNedostupanRazlog(RazlogNedostupnosti.DO_KRAJA_SMENE);
        zaVracanje.forEach(p -> {
            p.setDostupan(true);
            p.setNedostupanRazlog(null);
        });
        proizvodRepo.saveAll(zaVracanje);
        return zaVracanje.size();
    }

    /**
     * Automatsko otvaranje/zatvaranje smene prema radnom vremenu. Radi svakih
     * 60 sekundi:
     * <ul>
     *   <li>kad je zatvoreno (kraj radnog vremena ili start dok je zatvoreno) —
     *       vraća proizvode skinute "do kraja smene";</li>
     *   <li>kad je otvoreno (prelaz u otvoreno ILI prvi tik pri pokretanju u toku
     *       radnog vremena) — skida eventualnu ručnu pauzu, tako da se smena sama
     *       "upali" i ako je backend prespavao pa se probudio ujutru.</li>
     * </ul>
     */
    @Scheduled(fixedRate = 60_000)
    @Transactional
    public void automatskaSmena() {
        boolean otvoreno = radnoVremeService.jeOtvorenoSada();
        boolean prviTik = (biloOtvoreno == null);

        if (!otvoreno && (prviTik || biloOtvoreno)) {
            // Prelaz u zatvoreno (ili start dok je zatvoreno): vrati "do kraja smene" proizvode.
            int vraceno = vratiProizvodeDoKrajaSmene();
            log.info("Smena automatski zatvorena (kraj radnog vremena) — vraćeno {} proizvoda 'do kraja smene'.", vraceno);
        } else if (otvoreno && (prviTik || !biloOtvoreno)) {
            // Prelaz zatvoreno -> otvoreno, ili start u toku radnog vremena: nova smena.
            // Skini eventualnu ručnu pauzu (npr. zaostalu od jučerašnjeg zatvaranja).
            SmenaStanje s = stanjeEntitet();
            if (s.isPauzirano()) {
                s.setPauzirano(false);
                smenaStanjeRepo.save(s);
                log.info("Smena automatski otvorena ({}) — skinuta pauza, poručivanje aktivno.",
                        prviTik ? "pokretanje u toku radnog vremena" : "početak radnog vremena");
            }
        }

        biloOtvoreno = otvoreno;
    }

    private SmenaStatDto statistika(int brojProizvoda) {
        LocalDate danas = LocalDate.now(clock);
        List<Porudzbina> danasnje = porudzbinaRepo.findAllByStatus(StatusPorudzbine.REALIZOVANA).stream()
                .filter(p -> p.getDatum() != null && p.getDatum().toLocalDate().equals(danas))
                .toList();

        BigDecimal promet = danasnje.stream()
                .map(Porudzbina::getUkupanIznos)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long prosecnaPriprema = Math.round(danasnje.stream()
                .filter(p -> p.getProcenjenoVreme() != null)
                .mapToInt(Porudzbina::getProcenjenoVreme)
                .average()
                .orElse(0));

        return new SmenaStatDto(brojProizvoda, danasnje.size(), promet, prosecnaPriprema);
    }
}
