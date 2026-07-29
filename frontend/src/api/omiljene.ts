// Omiljene porudžbine — sačuvane kombinacije koje kupac ponavlja jednim klikom.
import { apiFetch } from './client';
import type { Porudzbina } from '../types/porudzbina';

/** Dodatak zapamćen uz stavku; cene nema jer se čita iz aktuelnog kataloga. */
export interface OmiljenaStavkaDodatak {
    proizvodId: number;
    nazivProizvoda: string;
    kolicina: number;
}

export interface OmiljenaStavka {
    proizvodId: number;
    nazivProizvoda: string;
    kolicina: number;
    dodaci?: OmiljenaStavkaDodatak[];
}

export interface Omiljena {
    id: number;
    naziv: string;
    stavke: OmiljenaStavka[];
}

/** Odgovor na ponavljanje: kreirana porudžbina i šta je server izostavio. */
export interface PonoviOdgovor {
    porudzbina: Porudzbina | null;
    preskoceno: string[];
}

export function getMoje() {
    return apiFetch<Omiljena[]>('/api/omiljene-porudzbine/moje', { auth: true });
}

export function sacuvajIzPorudzbine(porudzbinaId: number, naziv: string) {
    return apiFetch<Omiljena>(`/api/omiljene-porudzbine/iz-porudzbine/${porudzbinaId}`, {
        method: 'POST',
        auth: true,
        query: { naziv },
    });
}

/**
 * @param preskociNedostupno kad je `true`, server izostavi stavke i dodatke kojih
 *        nema umesto da odbije celu porudžbinu; šalje se tek pošto kupac potvrdi.
 */
export function ponovi(
    id: number,
    tipPorudzbine: string,
    napomena?: string,
    preskociNedostupno?: boolean,
) {
    return apiFetch<PonoviOdgovor>(`/api/omiljene-porudzbine/${id}/ponovi`, {
        method: 'POST',
        auth: true,
        query: {
            tipPorudzbine,
            napomena: napomena?.trim() || undefined,
            preskociNedostupno: preskociNedostupno || undefined,
        },
    });
}

export function obrisi(id: number) {
    return apiFetch<void>(`/api/omiljene-porudzbine/${id}`, {
        method: 'DELETE',
        auth: true,
    });
}
