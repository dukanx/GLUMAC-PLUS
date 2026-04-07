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

@Service
@Transactional
public class AlergenService {

    private final AlergenRepository repository;

    public AlergenService(AlergenRepository repository) {
        this.repository = repository;
    }

    public List<AlergenViewDto> getAll() {
        return repository.findAll().stream()
                .map(AlergenMapper::toViewDto)
                .collect(Collectors.toList());
    }

    public AlergenViewDto getById(Long id) {
        Alergen alergen = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alergen nije pronađen"));
        return AlergenMapper.toViewDto(alergen);
    }

    public AlergenViewDto getByNaziv(String naziv) {
        Alergen alergen = repository.findByNaziv(naziv)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alergen sa nazivom " + naziv + " nije pronađen"));
        return AlergenMapper.toViewDto(alergen);
    }

    public AlergenViewDto create(AlergenDto alergenDto) {
        if (repository.existsByNaziv(alergenDto.getNaziv())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Alergen sa tim nazivom već postoji");
        }
        Alergen alergen = AlergenMapper.toEntity(alergenDto);
        alergen = repository.save(alergen);
        return AlergenMapper.toViewDto(alergen);
    }

    public AlergenViewDto update(Long id, AlergenDto alergenData) {
        Alergen existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alergen nije pronađen"));

        existing.setNaziv(alergenData.getNaziv());
        existing.setOpis(alergenData.getOpis());

        existing = repository.save(existing);
        return AlergenMapper.toViewDto(existing);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Alergen nije pronađen");
        }
        repository.deleteById(id);
    }
}
