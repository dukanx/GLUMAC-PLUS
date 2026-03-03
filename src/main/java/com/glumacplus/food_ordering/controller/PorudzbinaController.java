package com.glumacplus.food_ordering.controller;

import com.glumacplus.food_ordering.dto.PorudzbinaDto;
import com.glumacplus.food_ordering.dto.PorudzbinaViewDto;
import com.glumacplus.food_ordering.model.StatusPorudzbine;
import com.glumacplus.food_ordering.repository.KorisnikRepository;
import com.glumacplus.food_ordering.repository.PorudzbinaRepository;
import com.glumacplus.food_ordering.service.PorudzbinaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/porudzbine")
@CrossOrigin
public class PorudzbinaController {

    private final PorudzbinaService service;
    private final KorisnikRepository korisnikRepository;
    private final PorudzbinaRepository porudzbinaRepository;

    public PorudzbinaController(PorudzbinaService service,KorisnikRepository korisnikRepository, PorudzbinaRepository porudzbinaRepository) {

        this.service = service;
        this.korisnikRepository = korisnikRepository;
        this.porudzbinaRepository = porudzbinaRepository;
    }

    @PostMapping
    public ResponseEntity<PorudzbinaViewDto> create(@RequestBody @Valid PorudzbinaDto dto){
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @GetMapping
    @PreAuthorize("hasRole('ZAPOSLENI') or hasRole('ADMIN')")
    public ResponseEntity<List<PorudzbinaViewDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }


    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ZAPOSLENI') or hasRole('ADMIN') or hasRole('KORISNIK')")
    public ResponseEntity<PorudzbinaViewDto> getById(@PathVariable Long id){
        return ResponseEntity.ok(service.getById(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_ZAPOSLENI') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> changeStatus(@PathVariable Long id, @RequestParam StatusPorudzbine status) {
        service.changeStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/moje")
    @PreAuthorize("hasRole('KORISNIK')")
    public ResponseEntity<List<PorudzbinaViewDto>> getMyOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(service.getMyOrders(page, size));
    }
}
