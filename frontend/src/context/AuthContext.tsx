import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { Korisnik, LoyaltyProgram } from '../types/korisnik';
import * as authApi from '../api/auth';

// ── Tipovi ──
interface AuthContextTip {
    korisnik: Korisnik | null;
    token: string | null;
    popust: number;
    loyaltyProgrami: LoyaltyProgram[];
    login: (korisnik: Korisnik, token: string) => void;
    logout: () => void;
    osvezi: () => Promise<void>;
}

// ── Kreiranje konteksta ──
const AuthContext = createContext<AuthContextTip | null>(null);

// ── Provider — obmotava celu aplikaciju ──
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [korisnik, setKorisnik] = useState<Korisnik | null>(() => {
        const json = localStorage.getItem('korisnik');
        return json ? JSON.parse(json) : null;
    });

    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem('token');
    });

    const [loyaltyProgrami, setLoyaltyProgrami] = useState<LoyaltyProgram[]>([]);

    useEffect(() => {
        authApi.getLoyaltyProgrami()
            .then(setLoyaltyProgrami)
            .catch(() => setLoyaltyProgrami([]));
    }, []);

    const popust = useMemo(() => {
        if (!korisnik?.loyaltyNivo) return 0;
        return loyaltyProgrami.find(p => p.nivo === korisnik.loyaltyNivo)?.popust ?? 0;
    }, [korisnik?.loyaltyNivo, loyaltyProgrami]);

    const login = (noviKorisnik: Korisnik, noviToken: string) => {
        localStorage.setItem('korisnik', JSON.stringify(noviKorisnik));
        localStorage.setItem('token', noviToken);
        setKorisnik(noviKorisnik);
        setToken(noviToken);
    };

    const logout = () => {
        localStorage.removeItem('korisnik');
        localStorage.removeItem('token');
        sessionStorage.removeItem('mojaKorpa');
        setKorisnik(null);
        setToken(null);
    };

    // Osvežavanje podatke o korisniku sa servera
    const osvezi = async () => {
        if (!token) return;
        try {
            const data = await authApi.getMe();
            setKorisnik(data);
            localStorage.setItem('korisnik', JSON.stringify(data));
        } catch {
            // tihi fail
        }
    };

    return (
        <AuthContext.Provider value={{ korisnik, token, popust, loyaltyProgrami, login, logout, osvezi }}>
            {children}
        </AuthContext.Provider>
    );
}

// ── Custom hook — koristiš ovo u komponentama ──
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth mora biti unutar AuthProvider-a');
    }
    return context;
}