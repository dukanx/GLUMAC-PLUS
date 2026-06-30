export interface Korisnik {
  id: number;
  ime: string;
  email: string;
  uloga?: string;
  brojBodova: number;
  loyaltyNivo?: string;
}

export interface LoyaltyProgram {
  id: number;
  nivo: string;
  popust: number;
  pragBodova: number;
}

export interface LoginRequest {
  email: string;
  lozinka: string;
}

export interface LoginResponse {
  token: string;
  korisnik: Korisnik;
}
