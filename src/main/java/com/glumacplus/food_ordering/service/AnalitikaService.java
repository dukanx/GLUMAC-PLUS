package com.glumacplus.food_ordering.service;

import com.glumacplus.food_ordering.dto.AnalitikaPregledDto;
import com.glumacplus.food_ordering.model.StatusPorudzbine;
import com.glumacplus.food_ordering.repository.PorudzbinaRepository;
import com.glumacplus.food_ordering.repository.StavkaPorudzbineRepository;
import com.glumacplus.food_ordering.util.Novac;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Brojevi za sekciju „Pregled" u admin panelu.
 *
 * <p>Sve se računa <b>na bazi</b>, agregatnim upitima. Ovde se samo sklapa
 * odgovor: spajaju se prodaja proizvoda i prodaja istih tih proizvoda kao
 * dodataka, i popunjavaju dani bez prometa.</p>
 *
 * <p>Promet uvek znači <b>realizovane</b> porudžbine. Nova ili otkazana
 * porudžbina nije prihod — pojavljuje se samo u raspodeli po statusima.</p>
 *
 * @author Nikola Dukić
 * @version 1.0
 */
@Service
@Transactional(readOnly = true)
public class AnalitikaService {

    /** Duži period nema smisla crtati po danima, a upit postaje skup. */
    private static final int MAX_DANA = 366;

    private final PorudzbinaRepository porudzbinaRepo;
    private final StavkaPorudzbineRepository stavkaRepo;

    public AnalitikaService(PorudzbinaRepository porudzbinaRepo, StavkaPorudzbineRepository stavkaRepo) {
        this.porudzbinaRepo = porudzbinaRepo;
        this.stavkaRepo = stavkaRepo;
    }

    /**
     * Sklapa ceo pregled za zadati period.
     *
     * @param odDatuma prvi dan perioda, uključivo
     * @param doDatuma poslednji dan perioda, UKLJUČIVO
     * @param limit koliko najprodavanijih proizvoda vratiti (1–50)
     * @return sažetak prometa, statusa, top proizvoda i prihoda po danima
     * @throws ResponseStatusException 400 ako datumi nedostaju, ako je početak
     *         posle kraja, ako je period duži od {@value #MAX_DANA} dana ili je
     *         {@code limit} van opsega
     */
    public AnalitikaPregledDto pregled(LocalDate odDatuma, LocalDate doDatuma, int limit) {
        proveriPeriod(odDatuma, doDatuma);
        if (limit < 1 || limit > 50) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parametar 'limit' mora biti između 1 i 50.");
        }

        LocalDateTime od = odDatuma.atStartOfDay();
        // Kraj je isključiv, pa se pomera na početak sledećeg dana — inače bi
        // porudžbina od 16:45 poslednjeg dana ispala iz zbira.
        LocalDateTime doVremena = doDatuma.plusDays(1).atStartOfDay();

        var promet = porudzbinaRepo.prihodZaPeriod(StatusPorudzbine.REALIZOVANA, od, doVremena);
        BigDecimal prihod = iznos(promet == null ? null : promet.getPrihod());
        long broj = promet == null ? 0L : promet.getBroj();
        BigDecimal popust = iznos(promet == null ? null : promet.getPopust());

        BigDecimal prosecnaKorpa = broj == 0
                ? BigDecimal.ZERO
                : Novac.zaokruzi(prihod.divide(BigDecimal.valueOf(broj), 2, RoundingMode.HALF_UP));

        return new AnalitikaPregledDto(
                prihod,
                broj,
                prosecnaKorpa,
                popust,
                statusi(od, doVremena),
                topProizvodi(od, doVremena, limit),
                poDanima(odDatuma, doDatuma, od, doVremena)
        );
    }

    /** Raspodela po statusima; status bez ijedne porudžbine ostaje nula. */
    private AnalitikaPregledDto.Statusi statusi(LocalDateTime od, LocalDateTime doVremena) {
        long nova = 0, uPripremi = 0, spremna = 0, realizovana = 0, otkazana = 0;

        for (Object[] red : porudzbinaRepo.brojPoStatusu(od, doVremena)) {
            StatusPorudzbine status = (StatusPorudzbine) red[0];
            long broj = ((Number) red[1]).longValue();
            switch (status) {
                case NOVA -> nova = broj;
                case U_PRIPREMI -> uPripremi = broj;
                case SPREMNA -> spremna = broj;
                case REALIZOVANA -> realizovana = broj;
                case OTKAZANA -> otkazana = broj;
            }
        }

        return new AnalitikaPregledDto.Statusi(nova, uPripremi, spremna, realizovana, otkazana,
                nova + uPripremi + spremna + realizovana + otkazana);
    }

    /**
     * Spaja prodaju proizvoda kao stavke i kao dodatka u jedan spisak — isti
     * proizvod naručen na oba načina mora da bude jedan red, inače se u vrhu
     * liste pojavi dvaput sa polovičnim brojevima.
     */
    private List<AnalitikaPregledDto.TopProizvod> topProizvodi(LocalDateTime od, LocalDateTime doVremena, int limit) {
        record Zbir(String naziv, double komada, BigDecimal promet) {}
        Map<Long, Zbir> po = new LinkedHashMap<>();

        List<StavkaPorudzbineRepository.PrometProjekcija> svi = new ArrayList<>();
        svi.addAll(stavkaRepo.prometPoProizvodima(StatusPorudzbine.REALIZOVANA, od, doVremena));
        svi.addAll(stavkaRepo.prometPoDodacima(StatusPorudzbine.REALIZOVANA, od, doVremena));

        for (var p : svi) {
            double komada = p.getKomada() == null ? 0 : p.getKomada();
            BigDecimal iznos = iznos(p.getPromet());
            po.merge(p.getProizvodId(), new Zbir(p.getNaziv(), komada, iznos),
                    (a, b) -> new Zbir(a.naziv(), a.komada() + b.komada(), a.promet().add(b.promet())));
        }

        return po.entrySet().stream()
                .map(e -> new AnalitikaPregledDto.TopProizvod(
                        e.getKey(), e.getValue().naziv(), e.getValue().komada(), Novac.zaokruzi(e.getValue().promet())))
                .sorted(Comparator.comparingDouble(AnalitikaPregledDto.TopProizvod::komada).reversed()
                        .thenComparing(AnalitikaPregledDto.TopProizvod::promet, Comparator.reverseOrder()))
                .limit(limit)
                .toList();
    }

    /**
     * Prihod po danima, sa <b>svim</b> danima perioda — i onima bez prometa.
     * Baza vraća samo dane u kojima nečega ima; kad bi se to prosledilo kao
     * jeste, grafikon bi spojio ponedeljak i četvrtak kao da su susedni.
     */
    private List<AnalitikaPregledDto.Dan> poDanima(LocalDate odDatuma, LocalDate doDatuma,
                                                   LocalDateTime od, LocalDateTime doVremena) {
        record Dnevno(BigDecimal prihod, long broj) {}
        Map<LocalDate, Dnevno> nadjeni = new LinkedHashMap<>();

        for (Object[] red : porudzbinaRepo.prihodPoDanima(StatusPorudzbine.REALIZOVANA, od, doVremena)) {
            LocalDate dan = LocalDate.of(
                    ((Number) red[0]).intValue(), ((Number) red[1]).intValue(), ((Number) red[2]).intValue());
            nadjeni.put(dan, new Dnevno(iznos((BigDecimal) red[3]), ((Number) red[4]).longValue()));
        }

        List<AnalitikaPregledDto.Dan> dani = new ArrayList<>();
        for (LocalDate d = odDatuma; !d.isAfter(doDatuma); d = d.plusDays(1)) {
            Dnevno n = nadjeni.get(d);
            dani.add(new AnalitikaPregledDto.Dan(d,
                    n == null ? BigDecimal.ZERO : n.prihod(),
                    n == null ? 0L : n.broj()));
        }
        return dani;
    }

    private void proveriPeriod(LocalDate odDatuma, LocalDate doDatuma) {
        if (odDatuma == null || doDatuma == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parametri 'od' i 'do' su obavezni.");
        }
        if (odDatuma.isAfter(doDatuma)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Početak perioda ne može biti posle kraja.");
        }
        if (ChronoUnit.DAYS.between(odDatuma, doDatuma) + 1 > MAX_DANA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Period ne može biti duži od " + MAX_DANA + " dana.");
        }
    }

    /** Prazan period vraća NULL iz {@code sum()}, a nula je tačniji odgovor od ničega. */
    private static BigDecimal iznos(BigDecimal vrednost) {
        return vrednost == null ? BigDecimal.ZERO : vrednost;
    }
}
