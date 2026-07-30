// Jedino mesto gde se računa cena stavke sa dodacima i gde se gradi potpis stavke.
// Koriste ga CartContext, korpa (drawer/mini) i detalj proizvoda, da matematika
// ne bude prepisana na više mesta.
import type { DodatakKorpe, Proizvod, StavkaKorpe } from '../types/proizvod';

/**
 * Potpis stavke = proizvod + izabrani dodaci (sortirano, pa je stabilan).
 * Ista palačinka sa istim dodacima daje isti potpis → spaja se u jednu stavku;
 * sa različitim dodacima → odvojene stavke.
 */
export function potpisStavke(proizvodId: number, dodaci: DodatakKorpe[]): string {
    const deo = [...dodaci]
        .map(d => `${d.proizvod.id}x${d.kolicina}`)
        .sort()
        .join(',');
    return deo ? `${proizvodId}|${deo}` : `${proizvodId}`;
}

/** Cena jedne jedinice: osnovni proizvod + svi dodaci. */
export function cenaJedinice(proizvod: Proizvod, dodaci: DodatakKorpe[]): number {
    return dodaci.reduce(
        (suma, d) => suma + d.proizvod.cena * d.kolicina,
        proizvod.cena
    );
}

/** Ukupna cena stavke: (osnovni proizvod + dodaci) × količina. */
export function cenaStavke(stavka: StavkaKorpe): number {
    return zaokruzi(cenaJedinice(stavka.proizvod, stavka.dodaci) * stavka.kolicina);
}

/* ── Novac ─────────────────────────────────────────────────────────────────
   RSD nema podjedinicu, pa svaki iznos koji kupac vidi mora biti ceo dinar.
   Isto pravilo je i na backendu (util/Novac.java) — korpa i račun moraju da
   pokažu isti broj.

   Popust se NIKAD ne računa direktno, nego kao razlika, jer
   round(a − b) ≠ a − round(b). Tako `osnovica = zaPlacanje + popust` važi uvek. */

/** Zaokružuje na ceo dinar (560.5 → 561). */
export function zaokruzi(iznos: number): number {
    return Math.round(iznos);
}

/** Iznos za plaćanje: osnovica sa popustom, zaokružena na ceo dinar. */
export function cenaSaPopustom(osnovica: number, popustProcenat: number): number {
    if (popustProcenat <= 0) return zaokruzi(osnovica);
    return zaokruzi(osnovica * (1 - popustProcenat / 100));
}

/** Koliko je popust oduzeo — izvedeno, da se zbir uvek poklapa. */
export function iznosPopusta(osnovica: number, popustProcenat: number): number {
    return zaokruzi(osnovica) - cenaSaPopustom(osnovica, popustProcenat);
}
