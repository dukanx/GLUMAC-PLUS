// Zajednički tipovi i labele za porudžbine — koristi se u korpi, istoriji, statusu, panelu i omiljenima.

export type TipPorudzbine = 'ZA_PONETI' | 'USPUT' | 'U_LOKALU';

// Status porudžbine — životni ciklus (isti kod u istoriji, statusu i panelu).
export type StatusPorudzbine = 'U_PRIPREMI' | 'SPREMNA' | 'REALIZOVANA' | 'OTKAZANA';

export const TIP_LABELE: Record<TipPorudzbine, string> = {
    ZA_PONETI: 'Za poneti',
    USPUT:     'Usput',
    U_LOKALU:  'U lokalu',
};

// Mapiranje naziva labele tipova
export function tipLabela(tip?: string): string {
    if (!tip) return '';
    return TIP_LABELE[tip as TipPorudzbine] ?? tip;
}

// Stavka porudžbine (superset — `iznosStavke` koristi istorija; panel ga ne prikazuje).
export interface StavkaPorudzbine {
    nazivProizvoda: string;
    kolicina: number;
    cena: number;
    iznosStavke: number;
}

// Porudžbina (superset polja iz istorije i panela; opciona polja su view-specifična).
export interface Porudzbina {
    porudzbinaId: number;
    datum: string;
    status: StatusPorudzbine;
    ukupanIznos: number;
    originalnaCena?: number;          // istorija (prikaz popusta)
    procenjenoVreme?: number | null;  // panel
    korisnikIme?: string;             // panel
    napomena?: string;
    tipPorudzbine?: string;
    stavke: StavkaPorudzbine[];
}