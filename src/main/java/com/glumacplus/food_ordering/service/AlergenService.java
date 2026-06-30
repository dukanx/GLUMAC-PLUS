package com.glumacplus.food_ordering.service;

import com.glumacplus.food_ordering.dto.AlergenDto;
import com.glumacplus.food_ordering.dto.AlergenMapper;
import com.glumacplus.food_ordering.dto.AlergenViewDto;
import com.glumacplus.food_ordering.model.Alergen;
import com.glumacplus.food_ordering.repository.AlergenRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servis za upravljanje alergenima.
 *
 * @author Nikola Dukić
 * @version 1.0
 */
@Service
@Transactional
public class AlergenService {

    private final AlergenRepository repository;

    /**
     * Kreira servis sa potrebnim repozitorijumom.
     *
     * @param repository repozitorijum alergena
     */
    public AlergenService(AlergenRepository repository) {
        this.repository = repository;
    }

    /**
     * Vraća sve alergene.
     *
     * @return lista svih alergena
     */
    public List<AlergenViewDto> getAll() {
        return repository.findAll().stream()
                .map(AlergenMapper::toViewDto)
                .collect(Collectors.toList());
    }

    /**
     * Vraća alergen po identifikatoru.
     *
     * @param id identifikator alergena
     * @return pronađeni alergen
     * @throws ResponseStatusException sa statusom 404 ako alergen ne postoji
     */
    public AlergenViewDto getById(Long id) {
        Alergen alergen = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alergen nije pronađen"));
        return AlergenMapper.toViewDto(alergen);
    }

    /**
     * Vraća alergen po nazivu.
     *
     * @param naziv naziv alergena
     * @return pronađeni alergen
     * @throws ResponseStatusException sa statusom 404 ako alergen ne postoji
     */
    public AlergenViewDto getByNaziv(String naziv) {
        Alergen alergen = repository.findByNaziv(naziv)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alergen sa nazivom " + naziv + " nije pronađen"));
        return AlergenMapper.toViewDto(alergen);
    }

    /**
     * Kreira novi alergen.
     *
     * @param alergenDto podaci o novom alergenu
     * @return kreirani alergen
     * @throws ResponseStatusException sa statusom 400 ako alergen sa tim nazivom već postoji
     */
    public AlergenViewDto create(AlergenDto alergenDto) {
        if (repository.existsByNaziv(alergenDto.getNaziv())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Alergen sa tim nazivom već postoji");
        }
        Alergen alergen = AlergenMapper.toEntity(alergenDto);
        alergen = repository.save(alergen);
        return AlergenMapper.toViewDto(alergen);
    }

    /**
     * Ažurira postojeći alergen.
     *
     * @param id identifikator alergena koji se ažurira
     * @param alergenData novi podaci o alergenu
     * @return ažurirani alergen
     * @throws ResponseStatusException sa statusom 404 ako alergen ne postoji
     */
    public AlergenViewDto update(Long id, AlergenDto alergenData) {
        Alergen existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alergen nije pronađen"));

        existing.setNaziv(alergenData.getNaziv());
        existing.setOpis(alergenData.getOpis());

        existing = repository.save(existing);
        return AlergenMapper.toViewDto(existing);
    }

    /**
     * Briše alergen po identifikatoru.
     *
     * @param id identifikator alergena koji se briše
     * @throws ResponseStatusException sa statusom 404 ako alergen ne postoji
     */
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Alergen nije pronađen");
        }
        repository.deleteById(id);
    }
}
