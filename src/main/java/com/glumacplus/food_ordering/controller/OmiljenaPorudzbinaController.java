package com.glumacplus.food_ordering.controller;

import com.glumacplus.food_ordering.dto.OmiljenaPorudzbinaViewDto;
import com.glumacplus.food_ordering.dto.PorudzbinaViewDto;
import com.glumacplus.food_ordering.model.TipPorudzbine;
import com.glumacplus.food_ordering.service.OmiljenaPorudzbinaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/omiljene-porudzbine")
@CrossOrigin
@PreAuthorize("hasRole('KORISNIK')")
public class OmiljenaPorudzbinaController {

    private final OmiljenaPorudzbinaService service;

    public OmiljenaPorudzbinaController(OmiljenaPorudzbinaService service) {
        this.service = service;
    }

    @GetMapping("/moje")
    public ResponseEntity<List<OmiljenaPorudzbinaViewDto>> getMyFavorites() {
        return ResponseEntity.ok(service.getMyFavorites());
    }

    @PostMapping("/iz-porudzbine/{porudzbinaId}")
    public ResponseEntity<OmiljenaPorudzbinaViewDto> createFromOrder(
            @PathVariable Long porudzbinaId,
            @RequestParam(required = false) String naziv
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createFromOrder(porudzbinaId, naziv));
    }

    @PostMapping("/{omiljenaPorudzbinaId}/ponovi")
    public ResponseEntity<PorudzbinaViewDto> repeatMyFavorite(
            @PathVariable Long omiljenaPorudzbinaId,
            @RequestParam(required = false) TipPorudzbine tipPorudzbine,
            @RequestParam(required = false) String napomena
    ) {
        return ResponseEntity.ok(service.repeatMyFavorite(omiljenaPorudzbinaId, tipPorudzbine, napomena));
    }

    @DeleteMapping("/{omiljenaPorudzbinaId}")
    public ResponseEntity<Void> deleteMyFavorite(@PathVariable Long omiljenaPorudzbinaId) {
        service.deleteMyFavorite(omiljenaPorudzbinaId);
        return ResponseEntity.noContent().build();
    }
}
