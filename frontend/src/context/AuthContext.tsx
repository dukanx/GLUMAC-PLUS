import { createContext, useContext, useState } from 'react';

// ── Tipovi ──
interface Korisnik {
    id: number;
    ime: string;
    email: string;
    brojBodova: number;
    loyaltyNivo?: string;
}

interface AuthContextTip {
    korisnik: Korisnik | null;
    token: string | null;
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

    // Osvežava podatke o korisniku sa servera (npr. posle porudžbine)
    const osvezi = async () => {
        if (!token) return;
        try {
            const res = await fetch('http://localhost:8080/api/korisnici/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setKorisnik(data);
                localStorage.setItem('korisnik', JSON.stringify(data));
            }
        } catch {
            // Tiho failuje — korisnik ostaje kao što je bio
        }
    };

    return (
        <AuthContext.Provider value={{ korisnik, token, login, logout, osvezi }}>
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