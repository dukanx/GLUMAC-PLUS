// Analitika — brojevi za sekciju „Pregled" u admin panelu.
import { apiFetch } from './client';

export interface Statusi {
    nova: number;
    uPripremi: number;
    spremna: number;
    realizovana: number;
    otkazana: number;
    ukupno: number;
}

export interface TopProizvod {
    proizvodId: number;
    naziv: string;
    komada: number;
    /** Bez popusta na nivou porudžbine — zbir svih proizvoda daje osnovicu. */
    promet: number;
}

export interface Dan {
    /** `yyyy-MM-dd`. */
    dan: string;
    prihod: number;
    brojPorudzbina: number;
}

export interface Pregled {
    prihod: number;
    brojPorudzbina: number;
    prosecnaKorpa: number;
    popust: number;
    statusi: Statusi;
    topProizvodi: TopProizvod[];
    /** Svi dani perioda, uključujući one bez prometa. */
    poDanima: Dan[];
}

/**
 * Ceo pregled jednim pozivom — namerno, jer je baza u Frankfurtu i svako
 * mrežno putovanje košta ~50 ms; četiri endpointa značila bi četiri čekanja.
 *
 * @param od prvi dan perioda (`yyyy-MM-dd`), uključivo
 * @param doDatuma poslednji dan perioda, takođe uključivo
 * @param limit koliko najprodavanijih proizvoda tražiti
 */
export function pregled(od: string, doDatuma: string, limit = 8) {
    return apiFetch<Pregled>('/api/analitika/pregled', {
        auth: true,
        query: { od, do: doDatuma, limit },
    });
}
