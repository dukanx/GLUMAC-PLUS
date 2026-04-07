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

@Service
@Transactional
public class RadnoVremeService {

    private final RadnoVremeRepository repository;

    public RadnoVremeService(RadnoVremeRepository repository) {
        this.repository = repository;
    }

    public List<RadnoVremeViewDto> getAll() {
        return repository.findAll().stream()
                .map(RadnoVremeMapper::toViewDto)
                .collect(Collectors.toList());
    }

    public List<RadnoVremeViewDto> getAktivna() {
        return repository.findByAktivno(true).stream()
                .map(RadnoVremeMapper::toViewDto)
                .collect(Collectors.toList());
    }

    public RadnoVremeViewDto getById(Long id) {
        RadnoVreme radnoVreme = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Radno vreme nije pronađeno"));
        return RadnoVremeMapper.toViewDto(radnoVreme);
    }

    public RadnoVremeViewDto getByDan(DanUNedelji dan) {
        RadnoVreme radnoVreme = repository.findByDan(dan)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Radno vreme za dan " + dan + " nije pronađeno"));
        return RadnoVremeMapper.toViewDto(radnoVreme);
    }

    public RadnoVremeViewDto create(RadnoVremeDto radnoVremeDto) {
        RadnoVreme radnoVreme = RadnoVremeMapper.toEntity(radnoVremeDto);
        radnoVreme = repository.save(radnoVreme);
        return RadnoVremeMapper.toViewDto(radnoVreme);
    }

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

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Radno vreme nije pronađeno");
        }
        repository.deleteById(id);
    }
}
