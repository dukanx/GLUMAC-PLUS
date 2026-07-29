// Centralni HTTP klijent za ceo frontend.
// React nema DI ni HTTP interceptor (kao Angular) — ovaj modul igra istu ulogu:
// jedno mesto koje zna bazni URL, serijalizuje JSON, automatski kači Bearer token
// na zaštićene pozive i normalizuje greške. Komponente ga ne zovu direktno, nego
// preko servisa (auth.ts, proizvodi.ts, porudzbine.ts).

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export interface ApiOpcije {
    method?: string;
    body?: unknown;
    auth?: boolean; // ako je true, zakači "Authorization: Bearer <token>" iz localStorage-a
    query?: Record<string, string | number | boolean | undefined>;
}

// Greška koja nosi HTTP status i (ako postoji) parsirano telo odgovora,
// da pozivalac može da pročita npr. { message } ili { errors } sa backenda.
export class ApiError extends Error {
    status: number;
    body: any;
    constructor(status: number, message: string, body: any = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.body = body;
    }
}

/**
 * Ime događaja koji se emituje kad backend odbije zahtev zbog isteklog/nevažećeg
 * tokena (401). `AuthContext` ga sluša i odjavljuje korisnika.
 *
 * <p>Ide preko događaja, a ne preko direktnog poziva, jer je ovo običan modul
 * bez pristupa React kontekstu. 403 se namerno NE hvata: to znači da je korisnik
 * prijavljen ali nema ulogu za tu akciju, pa odjava ne bi imala smisla.</p>
 */
export const DOGADJAJ_SESIJA_ISTEKLA = 'sesija-istekla';

function napraviQuery(query?: ApiOpcije['query']): string {
    if (!query) return '';
    const par = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
        if (v !== undefined) par.append(k, String(v));
    }
    const s = par.toString();
    return s ? `?${s}` : '';
}

export async function apiFetch<T>(path: string, opcije: ApiOpcije = {}): Promise<T> {
    const { method = 'GET', body, auth = false, query } = opcije;

    const headers: Record<string, string> = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (auth) {
        const token = localStorage.getItem('token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API}${path}${napraviQuery(query)}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        // Pokušaj da izvučeš telo greške (message/errors sa backenda); ako nije JSON, ostaje null.
        const telo = await res.json().catch(() => null);
        const poruka = telo?.message ?? `Greška ${res.status}`;

        // Samo na zaštićenim pozivima: 401 znači da token više ne važi.
        // Bez ovoga korisnik ostane "ulogovan" i vidi sirovu grešku na svakom ekranu.
        if (res.status === 401 && auth) {
            window.dispatchEvent(new CustomEvent(DOGADJAJ_SESIJA_ISTEKLA));
        }

        throw new ApiError(res.status, poruka, telo);
    }

    // 204 No Content ili prazno telo (npr. otkazivanje) — nema šta da se parsira.
    if (res.status === 204) return undefined as T;
    const text = await res.text();
    return (text ? JSON.parse(text) : undefined) as T;
}
