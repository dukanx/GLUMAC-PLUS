// Centralni domenski tipovi korisnika i loyalty programa.
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
