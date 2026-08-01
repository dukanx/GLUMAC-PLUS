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
