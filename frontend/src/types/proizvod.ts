// Centralni domenski tip proizvoda — koristi se na meniju, u korpi, na kartici i u omiljenima.
export interface Proizvod {
    id: number;
    naziv: string;
    opis?: string;
    cena: number;
    tip: string;
    dostupan?: boolean;
    nedostupanRazlog?: RazlogNedostupnosti | null;
    alergeniNazivi?: string[];
}

// Razlog zbog kog je proizvod skinut sa menija ("86 lista").
export type RazlogNedostupnosti = 'DO_KRAJA_SMENE' | 'DO_DALJNJEG';

// Stavka u korpi = proizvod + količina.
export interface StavkaKorpe {
    proizvod: Proizvod;
    kolicina: number;
}
