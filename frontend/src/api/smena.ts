// Smena (panel zaposlenog) — pregled dnevne statistike i zatvaranje smene.
import { apiFetch } from './client';

export interface SmenaStat {
    proizvodaZaVracanje: number;
    brojPorudzbina: number;
    promet: number;
    prosecnaPriprema: number;
}

export function pregledSmene() {
    return apiFetch<SmenaStat>('/api/smena/pregled', { auth: true });
}

export function zatvoriSmenu() {
    return apiFetch<SmenaStat>('/api/smena/zatvori', { method: 'POST', auth: true });
}

export interface SmenaStanje {
    pauzirano: boolean;
    uRadnomVremenu: boolean;
    primaPorudzbine: boolean;
}

export function stanjeSmene() {
    return apiFetch<SmenaStanje>('/api/smena/stanje', { auth: true });
}

export function pauzirajSmenu() {
    return apiFetch<SmenaStanje>('/api/smena/pauziraj', { method: 'POST', auth: true });
}

export function nastaviSmenu() {
    return apiFetch<SmenaStanje>('/api/smena/nastavi', { method: 'POST', auth: true });
}
