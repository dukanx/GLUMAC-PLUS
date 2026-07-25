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
    return cenaJedinice(stavka.proizvod, stavka.dodaci) * stavka.kolicina;
}
