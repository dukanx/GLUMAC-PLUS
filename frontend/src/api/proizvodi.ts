// Proizvodi servis — javni katalog (meni, početna, omiljene).
// Ekvivalent Angular ProizvodService / Android ApiService.proizvodi.
import { apiFetch } from './client';
import type { Proizvod } from '../types/proizvod';

export function getSvi() {
    return apiFetch<Proizvod[]>('/api/proizvodi');
}
