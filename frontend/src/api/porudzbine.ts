// Porudžbine servis — kreiranje, moje porudžbine, jedna porudžbina, otkazivanje.
// Ekvivalent Angular PorudzbinaService / Android ApiService porudžbina endpointa.
import { apiFetch } from './client';
import type { Porudzbina } from '../types/porudzbina';

export interface DodatakZahtev {
    proizvodId: number;
    kolicina: number;
}

export interface StavkaZahtev {
    proizvodId: number;
    kolicina: number;
    dodaci?: DodatakZahtev[];
}

export interface KreirajZahtev {
    tipPorudzbine: string;
    napomena: string | null;
    stavke: StavkaZahtev[];
}

// Backend za /moje može vratiti golu listu ili paginiran odgovor — pozivalac grana.
export interface StranicaOdgovor<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
}

export function kreiraj(zahtev: KreirajZahtev) {
    return apiFetch<Porudzbina>('/api/porudzbine', {
        method: 'POST',
        body: zahtev,
        auth: true,
    });
}

export function getMoje(page: number, size: number) {
    return apiFetch<Porudzbina[] | StranicaOdgovor<Porudzbina>>('/api/porudzbine/moje', {
        auth: true,
        query: { page, size },
    });
}

export function getJedan(id: number) {
    return apiFetch<Porudzbina>(`/api/porudzbine/${id}`, { auth: true });
}

// Aktivna porudžbina ulogovanog kupca (backend vraća 204/undefined ako je nema).
// Samo za ulogu KORISNIK — autoritativan izvor za floating dugme i praćenje.
export function getAktivna() {
    return apiFetch<Porudzbina | undefined>('/api/porudzbine/aktivna', { auth: true });
}

export function otkazi(id: number) {
    return apiFetch<void>(`/api/porudzbine/${id}/otkazi`, {
        method: 'POST',
        auth: true,
    });
}

/* ── Panel zaposlenog ── */

/** Sve porudžbine za panel (jedna velika strana; panel sam grupiše po statusu). */
export function getStranica(page = 0, size = 100) {
    return apiFetch<StranicaOdgovor<Porudzbina>>('/api/porudzbine/page', {
        auth: true,
        query: { page, size },
    });
}

export function promeniStatus(id: number, status: string) {
    return apiFetch<void>(`/api/porudzbine/${id}/status`, {
        method: 'PATCH',
        auth: true,
        query: { status },
    });
}

export function postaviProcenjenoVreme(id: number, procenjenoVreme: number) {
    return apiFetch<void>(`/api/porudzbine/${id}/procenjeno-vreme`, {
        method: 'PATCH',
        auth: true,
        query: { procenjenoVreme },
    });
}
