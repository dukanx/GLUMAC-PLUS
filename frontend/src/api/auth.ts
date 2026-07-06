// Auth servis — prijava, registracija, tekući korisnik, loyalty programi.
// Ekvivalent Angular AuthService / Android ApiService auth endpointa.
import { apiFetch } from './client';
import type { Korisnik, LoyaltyProgram } from '../types/korisnik';

export interface LoginOdgovor {
    korisnik: Korisnik;
    token: string;
}

export function login(email: string, lozinka: string) {
    return apiFetch<LoginOdgovor>('/api/auth/login', {
        method: 'POST',
        body: { email, lozinka },
    });
}

export function register(ime: string, email: string, lozinka: string) {
    return apiFetch<void>('/api/korisnici', {
        method: 'POST',
        body: { ime, email, lozinka },
    });
}

export function getMe() {
    return apiFetch<Korisnik>('/api/korisnici/me', { auth: true });
}

export function getLoyaltyProgrami() {
    return apiFetch<LoyaltyProgram[]>('/api/loyalty_program');
}
