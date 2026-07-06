// Porudžbine servis — kreiranje, moje porudžbine, jedna porudžbina, otkazivanje.
// Ekvivalent Angular PorudzbinaService / Android ApiService porudžbina endpointa.
import { apiFetch } from './client';
import type { Porudzbina } from '../types/porudzbina';

export interface StavkaZahtev {
    proizvodId: number;
    kolicina: number;
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

export function otkazi(id: number) {
    return apiFetch<void>(`/api/porudzbine/${id}/otkazi`, {
        method: 'POST',
        auth: true,
    });
}
