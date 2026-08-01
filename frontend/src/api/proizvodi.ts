// Proizvodi servis — javni katalog (meni, početna, omiljene).
// Ekvivalent Angular ProizvodService / Android ApiService.proizvodi.
import { apiFetch } from './client';
import type { Proizvod, RazlogNedostupnosti, Ukus } from '../types/proizvod';

export function getSvi() {
    return apiFetch<Proizvod[]>('/api/proizvodi');
}

// Dostupni dodaci za konfigurator; bez ukusa vraća sve dodatke.
export function getDodaci(ukus?: Ukus | null) {
    return apiFetch<Proizvod[]>('/api/proizvodi/dodaci', {
        query: ukus ? { ukus } : undefined,
    });
}

// ── Admin panel — upravljanje katalogom (sve traži ulogu ADMIN) ──

// Polja koja admin forma šalje. `jedinicaMere` i nutritivne vrednosti se nigde
// ne prikazuju, pa ih forma ne nudi; backend ih prima kao opciona.
export interface ProizvodUnos {
    naziv: string;
    tip: string;
    opis?: string | null;
    cena: number;
    ukus?: Ukus | null;
    dostupan?: boolean;
}

export function kreiraj(unos: ProizvodUnos) {
    return apiFetch<Proizvod>('/api/proizvodi', { method: 'POST', body: unos, auth: true });
}

export function izmeni(id: number, unos: ProizvodUnos) {
    return apiFetch<Proizvod>(`/api/proizvodi/${id}`, { method: 'PUT', body: unos, auth: true });
}

// Alergeni idu zasebnim pozivom — backend ih drži van osnovnog DTO-a.
export function postaviAlergene(id: number, alergeniIds: number[]) {
    return apiFetch<Proizvod>(`/api/proizvodi/${id}/alergeni`, {
        method: 'PUT',
        body: { alergeniIds },
        auth: true,
    });
}

// Panel zaposlenog — (ne)dostupnost proizvoda ("86 lista").
export function setDostupnost(id: number, dostupan: boolean, razlog?: RazlogNedostupnosti) {
    return apiFetch<Proizvod>(`/api/proizvodi/${id}/dostupnost`, {
        method: 'PATCH',
        auth: true,
        query: { dostupan, razlog },
    });
}
