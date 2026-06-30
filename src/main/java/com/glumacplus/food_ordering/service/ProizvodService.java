package com.glumacplus.food_ordering.service;

import com.glumacplus.food_ordering.dto.ProizvodDto;
import com.glumacplus.food_ordering.dto.ProizvodMapper;
import com.glumacplus.food_ordering.dto.ProizvodViewDto;
import com.glumacplus.food_ordering.model.Alergen;
import com.glumacplus.food_ordering.model.Proizvod;
import com.glumacplus.food_ordering.repository.AlergenRepository;
import com.glumacplus.food_ordering.repository.ProizvodRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Servis za upravljanje proizvodima i njihovim alergenima.
 *
 * @author Nikola Dukić
 * @version 1.0
 */
@Service
@Transactional
public class ProizvodService {

    private final ProizvodRepository repository;
    private final AlergenRepository alergenRepository;

    /**
     * Kreira servis sa potrebnim repozitorijumima.
     *
     * @param repository repozitorijum proizvoda
     * @param alergenRepository repozitorijum alergena
     */
    public ProizvodService(ProizvodRepository repository, AlergenRepository alergenRepository) {
        this.repository = repository;
        this.alergenRepository = alergenRepository;
    }

    /**
     * Vraća proizvode, opciono filtrirane po pojmu pretrage (naziv ili tip).
     *
     * @param term pojam pretrage, ili {@code null}/prazno za sve proizvode
     * @return lista proizvoda
     */
    public List<ProizvodViewDto> getAll(String term) {
        List<Proizvod> proizvodi;
        if (term == null || term.isBlank()) {
            proizvodi = repository.findAll();
        } else {
            proizvodi = repository.findByNazivContainingIgnoreCaseOrTipContainingIgnoreCase(term, term);
        }

        return proizvodi.stream()
                .map(ProizvodMapper::toViewDto)
                .collect(Collectors.toList());
    }

    /**
     * Vraća proizvod po identifikatoru.
     *
     * @param id identifikator proizvoda
     * @return pronađeni proizvod
     * @throws ResponseStatusException sa statusom 404 ako proizvod ne postoji
     */
    public ProizvodViewDto getById(Long id) {
        Proizvod proizvod = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Proizvod nije pronađen"));
        return ProizvodMapper.toViewDto(proizvod);
    }

    /**
     * Kreira novi proizvod.
     *
     * @param dto podaci o novom proizvodu
     * @return kreirani proizvod
     * @throws ResponseStatusException sa statusom 400 ako proizvod sa istim
     *         nazivom i tipom već postoji
     */
    public ProizvodViewDto create(ProizvodDto dto) {
        if (repository.existsByNazivAndTip(dto.getNaziv(), dto.getTip())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Proizvod već postoji!");
        }
        Proizvod p = ProizvodMapper.toEntity(dto);
        p = repository.save(p);
        return ProizvodMapper.toViewDto(p);
    }

    /**
     * Ažurira postojeći proizvod.
     *
     * @param id identifikator proizvoda koji se ažurira
     * @param dto novi podaci o proizvodu
     * @return ažurirani proizvod
     * @throws ResponseStatusException sa statusom 404 ako proizvod ne postoji
     */
    public ProizvodViewDto update(Long id, ProizvodDto dto) {
        Proizvod p = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Proizvod nije pronađen"));


        p.setNaziv(dto.getNaziv());
        p.setTip(dto.getTip());
        p.setCena(dto.getCena());
        p.setJedinicaMere(dto.getJedinicaMere());
        p.setKalorije(dto.getKalorije());
        p.setProteini(dto.getProteini());
        p.setMasti(dto.getMasti());
        p.setUgljeniHidrati(dto.getUgljeniHidrati());

        p = repository.save(p);
        return ProizvodMapper.toViewDto(p);
    }

    /**
     * Briše proizvod po identifikatoru.
     *
     * @param id identifikator proizvoda koji se briše
     * @throws ResponseStatusException sa statusom 404 ako proizvod ne postoji
     */
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Proizvod nije pronađen");
        }
        repository.deleteById(id);
    }

    /**
     * Postavlja skup alergena za zadati proizvod. Duplikati u listi ID-jeva se
     * ignorišu.
     *
     * @param proizvodId identifikator proizvoda
     * @param alergeniIds lista identifikatora alergena
     * @return ažurirani proizvod sa postavljenim alergenima
     * @throws ResponseStatusException sa statusom 400 ako je lista {@code null}
     *         ili sadrži nepostojeće alergene, odnosno 404 ako proizvod ne postoji
     */
    public ProizvodViewDto setAlergeni(Long proizvodId, List<Long> alergeniIds) {
        if (alergeniIds == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lista ID-jeva alergena je obavezna");
        }

        Proizvod proizvod = repository.findById(proizvodId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Proizvod nije pronađen"));

        Set<Long> uniqueIds = new HashSet<>(alergeniIds);
        List<Alergen> alergeni = alergenRepository.findAllById(uniqueIds);

        if (alergeni.size() != uniqueIds.size()) {
            Set<Long> pronadjeniIds = alergeni.stream()
                    .map(Alergen::getId)
                    .collect(Collectors.toSet());
            List<Long> nepostojeciIds = uniqueIds.stream()
                    .filter(id -> !pronadjeniIds.contains(id))
                    .sorted()
                    .collect(Collectors.toList());
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Nisu pronađeni alergeni sa ID-jevima: " + nepostojeciIds
            );
        }

        proizvod.setAlergeni(new HashSet<>(alergeni));
        proizvod = repository.save(proizvod);
        return ProizvodMapper.toViewDto(proizvod);
    }
}
