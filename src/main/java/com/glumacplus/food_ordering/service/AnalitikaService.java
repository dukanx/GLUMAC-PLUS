package com.glumacplus.food_ordering.service;

import com.glumacplus.food_ordering.dto.AnalitikaPrihodDto;
import com.glumacplus.food_ordering.dto.AnalitikaStatusiDto;
import com.glumacplus.food_ordering.dto.AnalitikaTopProizvodDto;
import com.glumacplus.food_ordering.model.StatusPorudzbine;
import com.glumacplus.food_ordering.repository.PorudzbinaRepository;
import com.glumacplus.food_ordering.repository.StavkaPorudzbineRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class AnalitikaService {

    private final PorudzbinaRepository porudzbinaRepo;
    private final StavkaPorudzbineRepository stavkaPorudzbineRepo;

    public AnalitikaService(PorudzbinaRepository porudzbinaRepo, StavkaPorudzbineRepository stavkaPorudzbineRepo) {
        this.porudzbinaRepo = porudzbinaRepo;
        this.stavkaPorudzbineRepo = stavkaPorudzbineRepo;
    }

    public List<AnalitikaTopProizvodDto> getTopProizvodi(LocalDate odDatuma, LocalDate doDatuma, int limit) {
        validatePeriod(odDatuma, doDatuma);
        validateLimit(limit);

        LocalDateTime od = odDatuma.atStartOfDay();
        LocalDateTime doVreme = doDatuma.plusDays(1).atStartOfDay();
        Pageable pageable = PageRequest.of(0, limit);

        return stavkaPorudzbineRepo.findTopProizvodiZaPeriod(StatusPorudzbine.REALIZOVANA, od, doVreme, pageable).stream()
                .map(p -> new AnalitikaTopProizvodDto(
                        p.getProizvodId(),
                        p.getNazivProizvoda(),
                        p.getUkupnoKomada() != null ? p.getUkupnoKomada() : 0.0,
                        p.getUkupanPromet() != null ? p.getUkupanPromet() : 0.0
                ))
                .toList();
    }

    public AnalitikaPrihodDto getPrihod(LocalDate odDatuma, LocalDate doDatuma) {
        validatePeriod(odDatuma, doDatuma);

        LocalDateTime od = odDatuma.atStartOfDay();
        LocalDateTime doVreme = doDatuma.plusDays(1).atStartOfDay();

        Object[] rezultat = porudzbinaRepo.findPrihodIBrojByStatusAndPeriod(StatusPorudzbine.REALIZOVANA, od, doVreme);
        double ukupanPrihod = rezultat != null && rezultat[0] instanceof Number
                ? ((Number) rezultat[0]).doubleValue()
                : 0.0;
        long brojRealizovanih = rezultat != null && rezultat[1] instanceof Number
                ? ((Number) rezultat[1]).longValue()
                : 0L;

        return new AnalitikaPrihodDto(ukupanPrihod, brojRealizovanih);
    }

    public AnalitikaStatusiDto getStatusi(LocalDate odDatuma, LocalDate doDatuma) {
        validatePeriod(odDatuma, doDatuma);

        LocalDateTime od = odDatuma.atStartOfDay();
        LocalDateTime doVreme = doDatuma.plusDays(1).atStartOfDay();

        AnalitikaStatusiDto dto = new AnalitikaStatusiDto();
        List<Object[]> rezultati = porudzbinaRepo.countPoStatusuZaPeriod(od, doVreme);
        for (Object[] red : rezultati) {
            StatusPorudzbine status = (StatusPorudzbine) red[0];
            long broj = ((Number) red[1]).longValue();

            switch (status) {
                case U_PRIPREMI -> dto.setUPripremi(broj);
                case SPREMNA -> dto.setSpremna(broj);
                case REALIZOVANA -> dto.setRealizovana(broj);
                case OTKAZANA -> dto.setOtkazana(broj);
            }
        }

        dto.setUkupno(dto.getUPripremi() + dto.getSpremna() + dto.getRealizovana() + dto.getOtkazana());
        return dto;
    }

    private void validatePeriod(LocalDate odDatuma, LocalDate doDatuma) {
        if (odDatuma == null || doDatuma == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parametri 'od' i 'do' su obavezni");
        }
        if (odDatuma.isAfter(doDatuma)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parametar 'od' ne može biti posle parametra 'do'");
        }
    }

    private void validateLimit(int limit) {
        if (limit < 1 || limit > 50) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parametar 'limit' mora biti između 1 i 50");
        }
    }
}
