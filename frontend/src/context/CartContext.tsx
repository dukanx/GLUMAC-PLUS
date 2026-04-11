import { createContext, useContext, useState, useEffect } from 'react';

interface Proizvod {
    id: number;
    naziv: string;
    opis?: string;
    cena: number;
    tip: string;
    alergeniNazivi?: string[];
}

interface StavkaKorpe {
    proizvod: Proizvod;
    kolicina: number;
}

interface CartContextTip {
    korpa: StavkaKorpe[];
    dodaj: (p: Proizvod) => void;
    povecaj: (id: number) => void;
    smanji: (id: number) => void;
    ukloni: (id: number) => void;
    isprazni: () => void;
    ukupnaCena: number;
    ukupnoStavki: number;
    drawerOtvoren: boolean;
    otvoriDrawer: () => void;
    zatvoriDrawer: () => void;
}

const CartContext = createContext<CartContextTip | null>(null);
const STORAGE_KEY = 'mojaKorpa';

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [korpa, setKorpa] = useState<StavkaKorpe[]>(() => {
        try {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    const [drawerOtvoren, setDrawerOtvoren] = useState(false);

    useEffect(() => {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(korpa));
        } catch { }
    }, [korpa]);

    const dodaj = (noviProizvod: Proizvod) => {
        setKorpa(prev => {
            const postoji = prev.find(i => i.proizvod.id === noviProizvod.id);
            if (postoji) {
                return prev.map(i =>
                    i.proizvod.id === noviProizvod.id
                        ? { ...i, kolicina: i.kolicina + 1 } : i
                );
            }
            return [...prev, { proizvod: noviProizvod, kolicina: 1 }];
        });
    };

    const povecaj = (id: number) =>
        setKorpa(prev => prev.map(i =>
            i.proizvod.id === id ? { ...i, kolicina: i.kolicina + 1 } : i
        ));

    const smanji = (id: number) =>
        setKorpa(prev =>
            prev.map(i => i.proizvod.id === id ? { ...i, kolicina: i.kolicina - 1 } : i)
                .filter(i => i.kolicina > 0)
        );

    const ukloni = (id: number) =>
        setKorpa(prev => prev.filter(i => i.proizvod.id !== id));

    const isprazni = () => {
        setKorpa([]);
        sessionStorage.removeItem(STORAGE_KEY);
    };

    const ukupnaCena = Math.round(korpa.reduce((sum, i) => sum + i.proizvod.cena * i.kolicina, 0));
    const ukupnoStavki = korpa.reduce((sum, i) => sum + i.kolicina, 0);

    return (
        <CartContext.Provider value={{
            korpa, dodaj, povecaj, smanji, ukloni, isprazni,
            ukupnaCena, ukupnoStavki,
            drawerOtvoren,
            otvoriDrawer: () => setDrawerOtvoren(true),
            zatvoriDrawer: () => setDrawerOtvoren(false),
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart mora biti unutar CartProvider-a');
    return context;
}
