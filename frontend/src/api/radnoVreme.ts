// Radno vreme — stalni nedeljni raspored. Današnji izuzetak („danas ne radimo")
// nije ovde nego u panelu zaposlenog, kroz zatvaranje smene.
import { apiFetch } from './client';
import type { DanKljuc } from '../hooks/useRadnoVreme';

export interface RadnoVreme {
    id: number;
    dan: DanKljuc;
    /** `HH:mm:ss` sa backenda. */
    odVremena: string;
    doVremena: string;
    aktivno: boolean;
}

export interface RadnoVremeUnos {
    dan: DanKljuc;
    odVremena: string;
    doVremena: string;
    aktivno: boolean;
}

export function getSvi() {
    return apiFetch<RadnoVreme[]>('/api/radno-vreme');
}

export function izmeni(id: number, unos: RadnoVremeUnos) {
    return apiFetch<RadnoVreme>(`/api/radno-vreme/${id}`, { method: 'PUT', body: unos, auth: true });
}

export function kreiraj(unos: RadnoVremeUnos) {
    return apiFetch<RadnoVreme>('/api/radno-vreme', { method: 'POST', body: unos, auth: true });
}
