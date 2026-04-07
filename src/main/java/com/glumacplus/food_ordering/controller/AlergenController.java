package com.glumacplus.food_ordering.controller;

import com.glumacplus.food_ordering.dto.AlergenDto;
import com.glumacplus.food_ordering.dto.AlergenViewDto;
import com.glumacplus.food_ordering.service.AlergenService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alergeni")
@CrossOrigin
public class AlergenController {

    private final AlergenService service;

    public AlergenController(AlergenService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<AlergenViewDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlergenViewDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/naziv/{naziv}")
    public ResponseEntity<AlergenViewDto> getByNaziv(@PathVariable String naziv) {
        return ResponseEntity.ok(service.getByNaziv(naziv));
    }

    @PostMapping
    @PreAuthorize("hasRole('ZAPOSLENI') or hasRole('ADMIN')")
    public ResponseEntity<AlergenViewDto> create(@RequestBody @Valid AlergenDto alergen) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(alergen));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ZAPOSLENI') or hasRole('ADMIN')")
    public ResponseEntity<AlergenViewDto> update(@PathVariable Long id, @RequestBody @Valid AlergenDto alergen) {
        return ResponseEntity.ok(service.update(id, alergen));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ZAPOSLENI') or hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
