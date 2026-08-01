// Alergeni — lista za admin formu proizvoda.
import { apiFetch } from './client';

export interface Alergen {
    id: number;
    naziv: string;
    opis?: string | null;
}

export function getSvi() {
    return apiFetch<Alergen[]>('/api/alergeni');
}

export function kreiraj(naziv: string) {
    return apiFetch<Alergen>('/api/alergeni', { method: 'POST', body: { naziv }, auth: true });
}
