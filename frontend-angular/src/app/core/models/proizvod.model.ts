export interface Proizvod {
  id: number;
  naziv: string;
  opis?: string;
  cena: number;
  tip: string;
  alergeniNazivi?: string[];
}

export interface StavkaKorpe {
  proizvod: Proizvod;
  kolicina: number;
}
