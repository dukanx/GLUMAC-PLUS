package com.glumacplus.food_ordering.service;

import com.glumacplus.food_ordering.model.Alergen;
import com.glumacplus.food_ordering.repository.AlergenRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class AlergenService {

    private final AlergenRepository repository;

    public AlergenService(AlergenRepository repository) {
        this.repository = repository;
    }

    public List<Alergen> getAll() {
        return repository.findAll();
    }

    public Alergen getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alergen nije pronađen"));
    }

    public Alergen getByNaziv(String naziv) {
        return repository.findByNaziv(naziv)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alergen sa nazivom " + naziv + " nije pronađen"));
    }

    public Alergen create(Alergen alergen) {
        if (repository.existsByNaziv(alergen.getNaziv())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Alergen sa tim nazivom već postoji");
        }
        return repository.save(alergen);
    }

    public Alergen update(Long id, Alergen alergenData) {
        Alergen existing = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alergen nije pronađen"));

        existing.setNaziv(alergenData.getNaziv());
        existing.setOpis(alergenData.getOpis());

        return repository.save(existing);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Alergen nije pronađen");
        }
        repository.deleteById(id);
    }
}
