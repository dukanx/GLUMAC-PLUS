package com.glumacplus.food_ordering.service;

import com.glumacplus.food_ordering.model.DanUNedelji;
import com.glumacplus.food_ordering.model.RadnoVreme;
import com.glumacplus.food_ordering.repository.RadnoVremeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class RadnoVremeService {

    private final RadnoVremeRepository repository;

    public RadnoVremeService(RadnoVremeRepository repository) {
        this.repository = repository;
    }

    public List<RadnoVreme> getAll() {
        return repository.findAll();
    }

    public List<RadnoVreme> getAktivna() {
        return repository.findByAktivno(true);
    }

    public RadnoVreme getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Radno vreme nije pronađeno"));
    }

    public RadnoVreme getByDan(DanUNedelji dan) {
        return repository.findByDan(dan)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Radno vreme za dan " + dan + " nije pronađeno"));
    }

    public RadnoVreme create(RadnoVreme radnoVreme) {
        return repository.save(radnoVreme);
    }

    public RadnoVreme update(Long id, RadnoVreme radnoVremeData) {
        RadnoVreme existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Radno vreme nije pronađeno"));

        existing.setDan(radnoVremeData.getDan());
        existing.setOdVremena(radnoVremeData.getOdVremena());
        existing.setDoVremena(radnoVremeData.getDoVremena());
        existing.setAktivno(radnoVremeData.getAktivno());

        return repository.save(existing);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Radno vreme nije pronađeno");
        }
        repository.deleteById(id);
    }
}
