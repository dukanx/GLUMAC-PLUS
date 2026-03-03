package com.glumacplus.food_ordering.controller;


import com.glumacplus.food_ordering.dto.KorisnikDto;
import com.glumacplus.food_ordering.dto.KorisnikViewDto;
import com.glumacplus.food_ordering.service.KorisnikService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/korisnici")
@CrossOrigin
public class KorisnikController {

    private final KorisnikService service;

    public KorisnikController(KorisnikService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<KorisnikViewDto> create(@RequestBody @Valid KorisnikDto dto){
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<KorisnikViewDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<KorisnikViewDto> getById(@PathVariable Long id){
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<KorisnikViewDto> getByEmail(@RequestParam String email) {
        return ResponseEntity.ok(service.findByEmail(email));
    }
}
