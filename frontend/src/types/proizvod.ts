// Centralni domenski tip proizvoda — koristi se na meniju, u korpi, na kartici i u omiljenima.
export interface Proizvod {
    id: number;
    naziv: string;
    opis?: string;
    cena: number;
    tip: string;
    alergeniNazivi?: string[];
}

// Stavka u korpi = proizvod + količina.
export interface StavkaKorpe {
    proizvod: Proizvod;
    kolicina: number;
}
