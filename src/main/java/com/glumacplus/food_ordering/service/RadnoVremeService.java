package com.glumacplus.food_ordering.service;

import com.glumacplus.food_ordering.dto.RadnoVremeDto;
import com.glumacplus.food_ordering.dto.RadnoVremeMapper;
import com.glumacplus.food_ordering.dto.RadnoVremeViewDto;
import com.glumacplus.food_ordering.model.DanUNedelji;
import com.glumacplus.food_ordering.model.RadnoVreme;
import com.glumacplus.food_ordering.repository.RadnoVremeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servis za upravljanje radnim vremenom restorana.
 *
 * @author Nikola Dukić
 * @version 1.0
 */
@Service
@Transactional
public class RadnoVremeService {

    private final RadnoVremeRepository repository;

    /**
     * Kreira servis sa potrebnim repozitorijumom.
     *
     * @param repository repozitorijum radnog vremena
     */
    public RadnoVremeService(RadnoVremeRepository repository) {
        this.repository = repository;
    }

    /**
     * Vraća sve unose radnog vremena.
     *
     * @return lista svih unosa radnog vremena
     */
    public List<RadnoVremeViewDto> getAll() {
        return repository.findAll().stream()
                .map(RadnoVremeMapper::toViewDto)
                .collect(Collectors.toList());
    }

    /**
     * Vraća sve aktivne unose radnog vremena.
     *
     * @return lista aktivnih unosa radnog vremena
     */
    public List<RadnoVremeViewDto> getAktivna() {
        return repository.findByAktivno(true).stream()
                .map(RadnoVremeMapper::toViewDto)
                .collect(Collectors.toList());
    }

    /**
     * Vraća radno vreme po identifikatoru.
     *
     * @param id identifikator radnog vremena
     * @return pronađeno radno vreme
     * @throws ResponseStatusException sa statusom 404 ako radno vreme ne postoji
     */
    public RadnoVremeViewDto getById(Long id) {
        RadnoVreme radnoVreme = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Radno vreme nije pronađeno"));
        return RadnoVremeMapper.toViewDto(radnoVreme);
    }

    /**
     * Vraća radno vreme za zadati dan u nedelji.
     *
     * @param dan dan u nedelji
     * @return pronađeno radno vreme
     * @throws ResponseStatusException sa statusom 404 ako radno vreme za dan ne postoji
     */
    public RadnoVremeViewDto getByDan(DanUNedelji dan) {
        RadnoVreme radnoVreme = repository.findByDan(dan)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Radno vreme za dan " + dan + " nije pronađeno"));
        return RadnoVremeMapper.toViewDto(radnoVreme);
    }

    /**
     * Kreira novi unos radnog vremena.
     *
     * @param radnoVremeDto podaci o novom radnom vremenu
     * @return kreirano radno vreme
     */
    public RadnoVremeViewDto create(RadnoVremeDto radnoVremeDto) {
        RadnoVreme radnoVreme = RadnoVremeMapper.toEntity(radnoVremeDto);
        radnoVreme = repository.save(radnoVreme);
        return RadnoVremeMapper.toViewDto(radnoVreme);
    }

    /**
     * Ažurira postojeći unos radnog vremena.
     *
     * @param id identifikator radnog vremena koje se ažurira
     * @param radnoVremeData novi podaci o radnom vremenu
     * @return ažurirano radno vreme
     * @throws ResponseStatusException sa statusom 404 ako radno vreme ne postoji
     */
    public RadnoVremeViewDto update(Long id, RadnoVremeDto radnoVremeData) {
        RadnoVreme existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Radno vreme nije pronađeno"));

        existing.setDan(radnoVremeData.getDan());
        existing.setOdVremena(radnoVremeData.getOdVremena());
        existing.setDoVremena(radnoVremeData.getDoVremena());
        if (radnoVremeData.getAktivno() != null) {
            existing.setAktivno(radnoVremeData.getAktivno());
        }

        existing = repository.save(existing);
        return RadnoVremeMapper.toViewDto(existing);
    }

    /**
     * Briše unos radnog vremena po identifikatoru.
     *
     * @param id identifikator radnog vremena koje se briše
     * @throws ResponseStatusException sa statusom 404 ako radno vreme ne postoji
     */
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Radno vreme nije pronađeno");
        }
        repository.deleteById(id);
    }
}
