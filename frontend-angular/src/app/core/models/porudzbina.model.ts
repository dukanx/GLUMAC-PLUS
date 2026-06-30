export type StatusPorudzbine = 'U_PRIPREMI' | 'SPREMNA' | 'REALIZOVANA' | 'OTKAZANA';
export type TipPorudzbine = 'ZA_PONETI' | 'USPUT' | 'U_LOKALU';

export const TIP_LABELE: Record<TipPorudzbine, string> = {
  ZA_PONETI: 'Za poneti',
  USPUT: 'Usput',
  U_LOKALU: 'U lokalu',
};

export interface StavkaPorudzbine {
  nazivProizvoda: string;
  kolicina: number;
  cena: number;
  iznosStavke: number;
}

export interface Porudzbina {
  porudzbinaId: number;
  datum: string;
  status: StatusPorudzbine;
  ukupanIznos: number;
  originalnaCena?: number;
  napomena?: string;
  tipPorudzbine?: string;
  stavke: StavkaPorudzbine[];
}

export interface PorudzbinaRequest {
  tipPorudzbine: TipPorudzbine;
  napomena: string | null;
  stavke: { proizvodId: number; kolicina: number }[];
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}
