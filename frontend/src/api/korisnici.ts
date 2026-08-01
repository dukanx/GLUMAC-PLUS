// Korisnici — samo ono što admin panelu treba za upravljanje pristupom.
import { apiFetch } from './client';

export type Uloga = 'ADMIN' | 'ZAPOSLENI' | 'KORISNIK';

export interface Korisnik {
    id: number;
    ime: string;
    email: string;
    brojBodova: number;
    loyaltyNivo: string | null;
    uloga: Uloga;
    blokiran: boolean;
}

export function getSvi() {
    return apiFetch<Korisnik[]>('/api/korisnici', { auth: true });
}

/** Backend traži tačan e-mail; nema pretrage po delu imena. */
export function nadjiPoEmailu(email: string) {
    return apiFetch<Korisnik>('/api/korisnici/search', { auth: true, query: { email } });
}

export function promeniUlogu(id: number, uloga: Uloga) {
    return apiFetch<Korisnik>(`/api/korisnici/${id}/uloga`, {
        method: 'PATCH',
        body: { uloga },
        auth: true,
    });
}

/**
 * Šalje se promena, ne novo stanje — dva istovremena dodavanja se tako sabiraju
 * umesto da drugo pregazi prvo. Backend uz bodove usklađuje i loyalty nivo.
 */
export function promeniBodove(id: number, promena: number) {
    return apiFetch<Korisnik>(`/api/korisnici/${id}/bodovi`, {
        method: 'PATCH',
        body: { promena },
        auth: true,
    });
}

export function postaviBlokiran(id: number, blokiran: boolean) {
    return apiFetch<Korisnik>(`/api/korisnici/${id}/blokiran`, {
        method: 'PATCH',
        body: { blokiran },
        auth: true,
    });
}
