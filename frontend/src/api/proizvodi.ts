// Proizvodi servis — javni katalog (meni, početna, omiljene).
// Ekvivalent Angular ProizvodService / Android ApiService.proizvodi.
import { apiFetch } from './client';
import type { Proizvod, RazlogNedostupnosti } from '../types/proizvod';

export function getSvi() {
    return apiFetch<Proizvod[]>('/api/proizvodi');
}

// Panel zaposlenog — (ne)dostupnost proizvoda ("86 lista").
export function setDostupnost(id: number, dostupan: boolean, razlog?: RazlogNedostupnosti) {
    return apiFetch<Proizvod>(`/api/proizvodi/${id}/dostupnost`, {
        method: 'PATCH',
        auth: true,
        query: { dostupan, razlog },
    });
}
