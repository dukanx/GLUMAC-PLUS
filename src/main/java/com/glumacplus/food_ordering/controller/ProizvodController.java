package com.glumacplus.food_ordering.controller;

import com.glumacplus.food_ordering.dto.ProizvodAlergeniUpdateDto;
import com.glumacplus.food_ordering.dto.ProizvodDto;
import com.glumacplus.food_ordering.dto.ProizvodViewDto;
import com.glumacplus.food_ordering.service.ProizvodService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proizvodi")
@CrossOrigin
public class ProizvodController {

    private final ProizvodService service;

    public ProizvodController(ProizvodService service) {
        this.service = service;
    }



    @PostMapping
    @PreAuthorize("hasRole('ZAPOSLENI') or hasRole('ADMIN')")
    public ResponseEntity<ProizvodViewDto> create(@RequestBody @Valid ProizvodDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<ProizvodViewDto>> getAll(@RequestParam(name = "q", required = false) String term) {
        return ResponseEntity.ok(service.getAll(term));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProizvodViewDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ZAPOSLENI') or hasRole('ADMIN')")
    public ResponseEntity<ProizvodViewDto> update(@PathVariable Long id, @RequestBody @Valid ProizvodDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PutMapping("/{id}/alergeni")
    @PreAuthorize("hasRole('ZAPOSLENI') or hasRole('ADMIN')")
    public ResponseEntity<ProizvodViewDto> setAlergeni(
            @PathVariable Long id,
            @RequestBody @Valid ProizvodAlergeniUpdateDto dto
    ) {
        return ResponseEntity.ok(service.setAlergeni(id, dto.getAlergeniIds()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ZAPOSLENI') or hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
