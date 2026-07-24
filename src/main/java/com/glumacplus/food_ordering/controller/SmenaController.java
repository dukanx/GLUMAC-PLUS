package com.glumacplus.food_ordering.controller;

import com.glumacplus.food_ordering.dto.SmenaStanjeDto;
import com.glumacplus.food_ordering.dto.SmenaStatDto;
import com.glumacplus.food_ordering.service.SmenaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoint-i za smenu (panel zaposlenog): pregled i zatvaranje smene.
 */
@RestController
@RequestMapping("/api/smena")
@CrossOrigin
public class SmenaController {

    private final SmenaService service;

    public SmenaController(SmenaService service) {
        this.service = service;
    }

    @GetMapping("/pregled")
    @PreAuthorize("hasRole('ZAPOSLENI') or hasRole('ADMIN')")
    public ResponseEntity<SmenaStatDto> pregled() {
        return ResponseEntity.ok(service.pregled());
    }

    @GetMapping("/stanje")
    @PreAuthorize("hasRole('ZAPOSLENI') or hasRole('ADMIN')")
    public ResponseEntity<SmenaStanjeDto> stanje() {
        return ResponseEntity.ok(service.stanje());
    }

    @PostMapping("/pauziraj")
    @PreAuthorize("hasRole('ZAPOSLENI') or hasRole('ADMIN')")
    public ResponseEntity<SmenaStanjeDto> pauziraj() {
        return ResponseEntity.ok(service.setPauza(true));
    }

    @PostMapping("/nastavi")
    @PreAuthorize("hasRole('ZAPOSLENI') or hasRole('ADMIN')")
    public ResponseEntity<SmenaStanjeDto> nastavi() {
        return ResponseEntity.ok(service.setPauza(false));
    }

    @PostMapping("/zatvori")
    @PreAuthorize("hasRole('ZAPOSLENI') or hasRole('ADMIN')")
    public ResponseEntity<SmenaStatDto> zatvori() {
        return ResponseEntity.ok(service.zatvori());
    }
}
