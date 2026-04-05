package com.glumacplus.food_ordering.controller;

import com.glumacplus.food_ordering.dto.NotifikacijaCreateDto;
import com.glumacplus.food_ordering.dto.NotifikacijaViewDto;
import com.glumacplus.food_ordering.service.NotifikacijaService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifikacije")
@CrossOrigin
public class NotifikacijaController {

    private final NotifikacijaService service;

    public NotifikacijaController(NotifikacijaService service) {
        this.service = service;
    }

    @GetMapping("/moje")
    @PreAuthorize("hasRole('KORISNIK') or hasRole('ZAPOSLENI') or hasRole('ADMIN')")
    public ResponseEntity<Page<NotifikacijaViewDto>> getMyNotifications(
            @RequestParam(required = false) Boolean procitana,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(service.getMyNotifications(procitana, page, size));
    }

    @PatchMapping("/{id}/procitana")
    @PreAuthorize("hasRole('KORISNIK') or hasRole('ZAPOSLENI') or hasRole('ADMIN')")
    public ResponseEntity<NotifikacijaViewDto> markMyNotificationReadState(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean value
    ) {
        return ResponseEntity.ok(service.markMyNotificationReadState(id, value));
    }

    @PatchMapping("/moje/procitaj-sve")
    @PreAuthorize("hasRole('KORISNIK') or hasRole('ZAPOSLENI') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Integer>> markAllMyAsRead() {
        int brojAzuriranih = service.markAllMyAsRead();
        return ResponseEntity.ok(Map.of("brojAzuriranih", brojAzuriranih));
    }

    @GetMapping("/moje/neprocitane-count")
    @PreAuthorize("hasRole('KORISNIK') or hasRole('ZAPOSLENI') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> countUnread() {
        return ResponseEntity.ok(Map.of("count", service.countUnread()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ZAPOSLENI') or hasRole('ADMIN')")
    public ResponseEntity<NotifikacijaViewDto> create(@RequestBody @Valid NotifikacijaCreateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }
}
