// Centralni domenski tip proizvoda — koristi se na meniju, u korpi, na kartici i u omiljenima.
export interface Proizvod {
    id: number;
    naziv: string;
    opis?: string;
    cena: number;
    tip: string;
    dostupan?: boolean;
    nedostupanRazlog?: RazlogNedostupnosti | null;
    ukus?: Ukus | null;
    alergeniNazivi?: string[];
    // ID-jevi alergena — admin forma njima označava već izabrane.
    alergeniIds?: number[];
}

// Razlog zbog kog je proizvod skinut sa menija ("86 lista").
export type RazlogNedostupnosti = 'DO_KRAJA_SMENE' | 'DO_DALJNJEG';

/**
 * Da li stavka uopšte ide pred kupca.
 *
 * Dve vrste nedostupnosti se ne prikazuju isto: DO_KRAJA_SMENE znači „danas je
 * nestalo, sutra se vraća" pa stavka ostaje na meniju zasivljena sa oznakom
 * „nema danas". DO_DALJNJEG znači da je skinuta sa ponude — takva se ne
 * prikazuje uopšte, jer bi inače zauvek stajala uz poruku koja obećava povratak.
 *
 * Panel zaposlenog NE koristi ovaj filter — njemu obe vrste moraju biti vidljive
 * da bi mogao da ih vrati u ponudu.
 */
export function uPonudi(p: Proizvod): boolean {
    return p.nedostupanRazlog !== 'DO_DALJNJEG';
}

// Ukus proizvoda — slatki dodaci idu uz slatke stavke, slani uz slane.
// null/undefined = nije primenljivo (piće, žestoko).
export type Ukus = 'SLATKO' | 'SLANO';

// Kategorija pod kojom se vode dodaci (par backend konstante Proizvod.TIP_DODACI).
// Dodaci se ne prikazuju kao zasebna kategorija u meniju kupca — biraju se uz stavku.
export const TIP_DODACI = 'Dodaci';

// Dodatak izabran uz stavku korpe (količina je po jednoj jedinici osnovnog proizvoda).
export interface DodatakKorpe {
    proizvod: Proizvod;
    kolicina: number;
}

// Stavka u korpi = proizvod + količina + izabrani dodaci.
// `id` je potpis (proizvod + dodaci): isti proizvod sa istim dodacima je ista stavka,
// a sa različitim dodacima su dve odvojene stavke.
export interface StavkaKorpe {
    id: string;
    proizvod: Proizvod;
    kolicina: number;
    dodaci: DodatakKorpe[];
}
